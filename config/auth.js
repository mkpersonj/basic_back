require("dotenv");
const { User } = require("../models/User");
const passport = require("passport");

// LocalStrategy
var LocalStrategy = require("passport-local");

// JwtStrategy
var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

//password
const util = require("util");
const crypto = require("crypto");
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

module.exports = () => {
  passport.use(
    new LocalStrategy(function verify(username, password, cb) {
      User.findOne({ $or: [{ nickname: username }, { email: username }] })
        .then(async (user) => {
          if (!user) {
            return cb(null, false, { message: "Account does not exist." });
          }

          const key = await pbkdf2Promise(
            password,
            user.salt,
            99999,
            64,
            "sha512"
          );
          const hashedPassword = key.toString("base64");

          if (hashedPassword !== user.password) {
            return cb(null, false, { message: "Password is wrong." });
          }

          return cb(null, user);
        })
        .catch((err) => {
          return cb(err);
        });
    })
  );

  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.SECRET_KEY;
  opts.issuer = process.env.ISSUER;

  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      console.log("jwt_payload", jwt_payload);

      User.findById(jwt_payload._id, { password: 0, salt: 0 })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Account does not exist." });
          }
        })
        .catch((err) => {
          return done(err, false);
        });
    })
  );
};
