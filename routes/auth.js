require("dotenv");
const express = require("express");
const { startSession } = require("mongoose");
const { User } = require("../models/User");
const router = express.Router();
const { passportWrap } = require("../middleware/auth");
const { asyncWrap } = require("../middleware/common");
//password
const util = require("util");
const crypto = require("crypto");
const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

//jwt
require("dotenv");
var jwt = require("jsonwebtoken");

router.post(
  "/signup",
  asyncWrap(async (req, res) => {
    const { nickname, email, password } = req.body;
    const session = await startSession();

    try {
      let user;
      await session.withTransaction(async () => {
        user = await User.find(
          { $or: [{ nickname }, { email }] },
          {},
          { session }
        );
        if (user.length > 0) {
          return res.send({
            fail: "This nickname or email address is already taken.",
          });
        }

        // cryupto password
        const buf = await randomBytesPromise(64);
        const salt = buf.toString("base64");
        const key = await pbkdf2Promise(password, salt, 99999, 64, "sha512");
        const hashedPassword = key.toString("base64");

        user = new User({ nickname, email, password: hashedPassword, salt });
        await user.save();

        return res.send();
      });
    } finally {
      await session.endSession();
    }
  })
);

router.post(
  "/login",
  passportWrap("local", async (user, res) => {
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      issuer: process.env.ISSUER,
    });
    const result = await User.findById(user._id, { password: 0, salt: 0 });

    return res.send({ user: result, token });
  })
);

router.get(
  "/test",
  passportWrap("jwt", (user, res) => {
    console.log(user);
    return res.send("test success");
  })
);

module.exports = router;
