const passport = require("passport");

exports.passportWrap = (strategy, fn) => {
  return (req, res, next) => {
    passport.authenticate(strategy, async (err, user, info) => {
      if (err) {
        next(err);
      }

      if (info) {
        return res.send({ fail: info.message });
      }

      fn(user, res);
    })(req, res, next);
  };
};
