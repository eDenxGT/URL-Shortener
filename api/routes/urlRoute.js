const express = require("express");
const router = express.Router();
const {
  createUrl,
  getUrls,
  getAnalytics,
  redirect,
} = require("../controller/urlController");
const auth = require("../middleware/auth");

router.route("/")
    .post(auth, createUrl)
    .get(auth, getUrls);
router.get("/:urlId/analytics", auth, getAnalytics);
router.get("/:shortUrl", redirect);

module.exports = router;
