import e from "express";
import helpers from "../helpers/portal.helpers.js";

const router = e.Router();
const helper = new helpers();

router.post("/add-callerId", function (req, res, next) {
  helper.addCallerId(req, res, next);
});

export default router;
