import e from "express";
import helpers from "../helpers/auth.helper.js";

const router = e.Router();
const helper = new helpers();

router.post("/sign-up", function (req, res, next) {
  helper.signUp(req, res, next);
});
router.post("/new-password", function (req, res, next) {
  helper.newPassword(req, res, next);
});
router.post("/sign-in", function (req, res, next) {
  helper.signIn(req, res, next);
});

export default router;
