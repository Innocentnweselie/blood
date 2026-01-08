const express = require("express");
const router = express.Router();
const invCtrl = require("../controllers/inventoryController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, invCtrl.getInventory);
router.post("/", auth, invCtrl.createItem);
router.put("/:id", auth, invCtrl.updateItem);
router.delete("/:id", auth, invCtrl.deleteItem);

module.exports = router;
