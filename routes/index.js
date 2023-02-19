var express = require("express");
var router = express.Router();
const { asyncWrap } = require("../middleware/common");

// 동기호출
router.get("/syncErrorTest", (req, res) => {
  return res.send(data);
});

// 비동기호출
router.get(
  "/asyncErrorTest",
  asyncWrap(async (req, res) => {
    return res.send(data);
  })
);
module.exports = router;
