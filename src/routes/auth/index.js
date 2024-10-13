const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/authMiddleware');
const { SignUp, SignIn, UpgradeAccount } = require('../../controllers/auth');

router.post("/signUp",SignUp)
router.post("/signIn", SignIn)
router.put("/UpgradeAccount", protect,UpgradeAccount)

module.exports = router;