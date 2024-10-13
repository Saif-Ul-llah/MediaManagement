const express = require("express");
const router = express.Router();
const Auth = require("./auth/index");
const UploadFile = require("./Media/index")

router.use(Auth);
router.use(UploadFile)

module.exports = router;
