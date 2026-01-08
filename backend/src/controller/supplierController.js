const prisma = require("../config/db");

// GET all suppliers
exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(
      suppliers.map((s) => ({
        _id: s.id,          // IMPORTANT: used by frontend
        name: s.name,
        contact: s.contact,
        email: s.email,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// CREATE supplier
exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contact, email } = req.body;

    const supplier = await prisma.supplier.create({
      data: { name, contact, email },
    });

    res.status(201).json({
      _id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE supplier
exports.updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact, email } = req.body;

    const updated = await prisma.supplier.update({
      where: { id },
      data: { name, contact, email },
    });

    res.json({
      _id: updated.id,
      name: updated.name,
      contact: updated.contact,
      email: updated.email,
    });
  } catch (err) {
    // Prisma record not found
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Supplier not found" });
    }
    next(err);
  }
};

// DELETE supplier
exports.deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.supplier.delete({
      where: { id },
    });

    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Supplier not found" });
    }
    next(err);
  }
};
