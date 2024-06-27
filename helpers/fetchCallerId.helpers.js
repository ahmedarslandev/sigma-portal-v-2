import { userModel, StateModel, callerIdModel } from "../models/models.js";

async function createIndexes() {
  await Promise.all([
    StateModel.createIndexes({ "areaCodes.code": 1 }),
    callerIdModel.createIndexes({ Number: 1 }),
  ]);
}

createIndexes();

class Helpers {
  fetchCallerId = async (req, res) => {
    try {
      const { userId, callerId } = req.query;
      const trimmedCallerId = callerId?.slice(-10);

      if (!userId || !trimmedCallerId) {
        return res
          .status(400)
          .json({ message: "userId or callerId not found", status: 400 });
      }

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found", status: 400 });
      }

      const userCode = trimmedCallerId.trim().substring(0, 3);
      const state = await StateModel.findOne({ "areaCodes.code": userCode });

      let callerIdNumber, callerIds;
      if (state) {
        callerIds = await callerIdModel.find({
          state: state.stateName,
          owner: user._id,
        });
        if (callerIds.length) {
          const index = (state.reqNumber || 0) % callerIds.length;
          callerIdNumber = callerIds[index].Number;
          state.reqNumber = (state.reqNumber || 0) + 1;
          await state.save();
        }
      }

      if (!callerIdNumber) {
        callerIds =
          callerIds || (await callerIdModel.find({ owner: user._id }));
        callerIdNumber = callerIds.length
          ? callerIds[Math.floor(Math.random() * callerIds.length)].Number
          : null;
      }

      if (!callerIdNumber) {
        return res
          .status(400)
          .json({ message: "CallerId not found", status: 400 });
      }

      const callerIdRecord = await callerIdModel.findOneAndUpdate(
        { Number: callerIdNumber },
        { $inc: { counts: 1 } },
        { new: true }
      );

      if (!callerIdRecord) {
        return res
          .status(400)
          .json({ message: "CallerId not found", status: 400 });
      }

      return res.send(callerIdNumber);
    } catch (error) {
      return res.status(500).json({ message: error.message, status: 500 });
    }
  };
}

export default Helpers;
