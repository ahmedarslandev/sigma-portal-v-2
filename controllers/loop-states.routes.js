import e from "express";
import helpers from "../helpers/loopStates.helper.js";

const router = e.Router();
const helper = new helpers();

router.post("/loop-states", function (req, res, next) {
  helper.loopStates(req, res, next);
});

export default router;
