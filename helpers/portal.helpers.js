import { userModel, StateModel, callerIdModel } from "../models/models.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class helpers {
  addCallerId = async function (req, res, next) {
    try {
      const { Number } = req.body;
      const callerId = await callerIdModel.findOne({ Number });

      const userCode = Number.trim().substring(0, 3);
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token not found",
          status: 401,
        });
      }

      const { id } = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
      const dbUser = await userModel.findById(id);

      if (!dbUser) {
        return res.status(400).json({
          success: false,
          message: "User not found",
          status: 400,
        });
      }

      const OwnerId = dbUser._id;
      const state = await StateModel.find({
        areaCodes: { $elemMatch: { code: userCode } },
      });

      if (!state || state.length === 0) {
        return res.status(400).json({
          success: false,
          message: "State not found",
          status: 400,
        });
      }

      if (callerId) {
        return res.status(400).json({
          success: false,
          message: "Number already exists",
          status: 400,
        });
      }

      const user = await userModel.findOne({ _id: OwnerId });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
          status: 400,
        });
      }

      const newCallerId = new callerIdModel({
        state: state[0]?.stateName,
        Number,
        owner: OwnerId,
      });

      state[0]?.callerIds.push(newCallerId);
      user.callerIds.push(newCallerId);

      await user.save();
      await state[0]?.save();
      await newCallerId.save();

      return res.status(200).json({
        success: true,
        message: "Number added successfully",
        status: 200,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal error occurred",
        status: 500,
      });
    }
  };
}

export default helpers;
