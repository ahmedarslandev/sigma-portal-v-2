import { userModel, StateModel } from "../models/models.js";
import { states } from "./states.js";
import dotenv from "dotenv";
dotenv.config();

class helpers {
  loopStates = async (req, res, next) => {
    try {
      const { userId } = req.body;
      const user = await userModel.findOne({ _id: userId });

      if (!user || !user.isAdmin) {
        return res.status(500).json({
          status: 500,
          success: false,
          message: "You are not allowed to add state",
        });
      }

      const existingStates = await StateModel.find();

      if (existingStates.length > 0) {
        return res.status(500).json({
          status: 500,
          success: false,
          message: "States already exist",
        });
      }

      for (const e of states) {
        const state = new StateModel({
          stateName: e.stateName,
          areaCodes: e.code.map((code) => ({ code })),
        });
        await state.save();
      }

      return res.status(200).json({
        status: 200,
        success: true,
        message: "State(s) added successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        success: false,
        message: "Internal Server Error",
      });
    }
  };
}

export default helpers;
