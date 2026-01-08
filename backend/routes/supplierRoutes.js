const express = require("express");
const router = express.Router();
const supplierCtrl = require("../controllers/supplierController");
const auth = require("../middleware/authMiddleware");

// GET
router.get("/", auth, supplierCtrl.getSuppliers);

// CREATE
router.post("/", auth, supplierCtrl.createSupplier);

// UPDATE
router.put("/:id", auth, supplierCtrl.updateSupplier);

// DELETE
router.delete("/:id", auth, supplierCtrl.deleteSupplier);

module.exports = router;
