const express = require("express");
const { asyncWrap } = require("../middleware/common");
const { User } = require("../models/User");
const router = express.Router();

router
  .get(
    "/",
    asyncWrap(async (req, res) => {
      const { nickname, _id } = req.query;

      const [user, users, userById] = await Promise.all([
        User.findOne({ nickname }),
        User.find({ nickname }),
        User.findById(_id),
      ]);
      return res.send({ user, users, userById });
    })
  )
  .post(
    "/",
    asyncWrap(async (req, res) => {
      const { nickname } = req.body;

      const user = new User({ nickname });
      await user.save();
      return res.send({ user });
    })
  )
  .put(
    "/",
    asyncWrap(async (req, res) => {
      const { _id, nickname } = req.body;

      const user = await User.findByIdAndUpdate(
        _id,
        { $set: { nickname } },
        { new: true }
      );
      return res.send({ user });
    })
  )
  .delete(
    "/:_id",
    asyncWrap(async (req, res) => {
      const { _id } = req.params;

      await User.deleteOne({ _id });
      return res.send("successful deleted.");
    })
  );

module.exports = router;
