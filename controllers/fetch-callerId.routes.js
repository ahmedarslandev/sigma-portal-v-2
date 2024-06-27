import e from "express";
import helpers from "../helpers/fetchCallerId.helpers.js";

const router = e.Router();
const helper = new helpers();

router.get("/fetch-callerId", (req, res, next) => {
  helper.fetchCallerId(req, res, next);
});

export default router;
