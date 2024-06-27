import express from "express";
import dotenv from "dotenv";
import authRoutes from "../controllers/auth.routes.js";
import portalRoutes from "../controllers/portal.routes.js";
import loopStatesRoutes from "../controllers/loop-states.routes.js";
import fetchCallerIdsRoutes from "../controllers/fetch-callerId.routes.js";
import { userModel, callerIdModel } from "../models/models.js";
import {isUserAuthenticated} from "../middlewares/authenticate.js";
import jwt from "jsonwebtoken";
import cluster from "cluster";
import { cpus } from "os";
import cron from "node-cron";
const numCPUs = cpus.length;
const router = express.Router();
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
dotenv.config();

cron.schedule("0 13 * * *", async () => {
  try {
    await callerIdModel.updateMany({}, { $set: { counts: 0 } });
    console.log("CallerId counts have been reset to zero");
  } catch (error) {
    console.error("Error resetting counts:", error);
  }
});

/* GET home page. */
router.get("/sign-up", (req, res, next) => {
  res.render("signUp", { title: "Express" });
});
router.get(
  "/",
  (req, res, next) => isUserAuthenticated(req, res, next),
  (req, res, next) => {
    res.render("addCallerId", { title: "Express" });
  }
);
router.get("/new-password", (req, res, next) => {
  res.render("newPassword", { title: "Express" });
});
router.get("/sign-in", (req, res, next) => {
  res.render("signIn", { title: "Express" });
});

router.get(
  "/profile/details",
  (req, res, next) => isUserAuthenticated(req, res, next),
  async (req, res, next) => {
    const encryptedToken = req.cookies.token;
    if (!encryptedToken) {
      return res.send("User not logged in");
    }
    const { id } = jwt.verify(encryptedToken, process.env.JWT_TOKEN_SECRET);
    const user = await userModel.findById(id).populate("callerIds");
    if (!user) {
      return res.send("User not found");
    }
    res.render("profile", { user: user });
  }
);
router.post(
  "/profile/update",
  (req, res, next) => isUserAuthenticated(req, res, next),
  async (req, res) => {
    try {
      const { callerIds } = req.body;
      callerIds.forEach(async (e) => {
        await callerIdModel.deleteOne({ _id: e });
      });
      return res.send("Deleted Successfully");
    } catch (error) {
      return res.send("Something went wrong");
    }
  }
);
router.get(
  "/delete/:id",
  (req, res, next) => isUserAuthenticated(req, res, next),
  async (req, res) => {
    try {
      const callerId = req.params.id;
      const encryptedToken = req.cookies.token;
      if (!encryptedToken) {
        return res.send("User not logged in");
      }
      const { id } = jwt.verify(encryptedToken, process.env.JWT_TOKEN_SECRET);
      const user = await userModel.findById(id).populate("callerIds");
      if (!user) {
        return res.send("User not found");
      }
      if (!id) {
        return res.send("CallerId not found");
      }

      await callerIdModel.deleteOne({ _id: callerId });
      return res.redirect("/profile/details");
    } catch (error) {
      return res.send(error.message);
    }
  }
);

router.use("/auth", authRoutes);
router.use("/portals", portalRoutes);
router.use("/", loopStatesRoutes);
router.use("/", fetchCallerIdsRoutes);
export default router;
