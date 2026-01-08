const express = require("express");
const router = express.Router();
const settingsCtrl = require("../controllers/settingsController");
const auth = require("../middleware/authMiddleware");

router.put("/profile", auth, settingsCtrl.updateProfile);
router.put("/password", auth, settingsCtrl.changePassword);

module.exports = router;
