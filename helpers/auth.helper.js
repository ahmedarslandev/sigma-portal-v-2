import { userModel, StateModel, callerIdModel } from "../models/models.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

class helpers {
  signUp = async (req, res, next) => {
    try {
      const { username, email } = req.body;

      const user = await userModel.findOne({ email: email });
      if (user?.isVerified === true) {
        return res.status(400).json({
          message: "User with provided email already exists",
          status: 400,
        });
      }

      const newUser = new userModel({
        username,
        email,
        callerIds: [],
        isAdmin: false,
        password: "",
        isVerified: true,
      });
      newUser.apiKey = `${req.protocol}://${req.hostname}:${req.socket.localPort}/fetch-callerId?userId=${newUser._id}&callerId=`;
      await newUser.save();

      const data = { email, username };
      const hashedEmail = jwt.sign(data, process.env.JWT_TOKEN_SECRET);
      res.cookie("email", hashedEmail);

      return res.status(200).json({
        status: 200,
        success: true,
        message: "User saved successfully",
        newUser,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  signIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
          status: 400,
        });
      }

      const user = await userModel.findOne({ email: email });

      if (!user) {
        return res.status(400).json({
          message: "User not found",
          status: 400,
        });
      }

      if (!user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User not verified",
          status: 400,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      res.clearCookie("email");

      if (!isMatch) {
        return res.status(400).json({
          message: "Passwords do not match",
          status: 400,
        });
      }

      const data = { id: user._id };
      const token = jwt.sign(data, process.env.JWT_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.cookie("token", token);

      return res.status(200).json({
        message: "User logged in successfully",
        status: 200,
        token: token,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
      });
    }
  };

  newPassword = async function (req, res, next) {
    try {
      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({
          status: 400,
          message: "Passwords do not match",
          success: false,
        });
      }

      const encryptedEmail = req.cookies.email;
      if (!encryptedEmail) {
        return res.status(400).json({
          status: 400,
          message: "Email not found",
          success: false,
        });
      }

      const { email } = jwt.verify(
        encryptedEmail,
        process.env.JWT_TOKEN_SECRET
      );
      if (!email) {
        return res.status(400).json({
          status: 400,
          message: "Email not found",
          success: false,
        });
      }

      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: 400,
          message: "User not found",
          success: false,
        });
      }

      const encryptedPassword = await bcrypt.hash(password, 10);
      user.password = encryptedPassword;
      await user.save();
      res.clearCookie("email");
      return res.status(200).json({
        status: 200,
        message: "Password saved successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        success: false,
      });
    }
  };
}

export default helpers;
