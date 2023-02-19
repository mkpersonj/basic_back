const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    nickname: { type: String, required: true },
    email: String,
    password: String,
    salt: String,
  },
  { timestamps: true }
);

const User = model("user", UserSchema);
module.exports = { User };
