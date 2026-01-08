const express = require("express");
const router = express.Router();
const dashCtrl = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, dashCtrl.getDashboard);

module.exports = router;
