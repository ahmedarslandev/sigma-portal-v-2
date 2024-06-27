import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const CallerSchema = new Schema({
  state: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  counts: {
    type: Number,
    default: 0,
  },
  Number: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/.+\@.+\..+/, "Please enter a valid email"],
  },
  password: {
    type: String,
  },
  callerIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "CallerIds",
    },
  ],
  isAdmin: {
    type: Boolean,
    default: false,
  },
  apiKey: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

const StateSchema = new Schema({
  stateName: {
    type: String,
    required: true,
  },
  areaCodes: [
    {
      code: String,
    },
  ],
  callerIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "CallerIds",
    },
  ],
  reqNumber: {
    type: Number,
    default: 0,
  },
});

const StateModel =
  mongoose.models.StateInfos || mongoose.model("StateInfos", StateSchema);
const callerIdModel =
  mongoose.models.CallerIds || mongoose.model("CallerIds", CallerSchema);
const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export { userModel, callerIdModel, StateModel };
