const prisma = require("../config/db");

const toFrontendItem = (item) => ({
  _id: item.id,
  name: item.name,
  batchNumber: item.batchNumber,
  quantity: item.quantity,
  reorderLevel: item.reorderLevel,
  expiryDate: item.expiryDate,
  supplier: item.supplier,
});

exports.getInventory = async (req, res, next) => {
  try {
    const items = await prisma.item.findMany({ orderBy: { createdAt: "desc" } });
    res.json(items.map(toFrontendItem));
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { name, batchNumber, quantity, reorderLevel, expiryDate, supplier } = req.body;

    const created = await prisma.item.create({
      data: {
        name,
        batchNumber,
        quantity: Number(quantity),
        reorderLevel: Number(reorderLevel),
        expiryDate: new Date(expiryDate),
        supplier,
      },
    });

    res.status(201).json(toFrontendItem(created));
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { name, batchNumber, quantity, reorderLevel, expiryDate, supplier } = req.body;

    const updated = await prisma.item.update({
      where: { id },
      data: {
        name,
        batchNumber,
        quantity: Number(quantity),
        reorderLevel: Number(reorderLevel),
        expiryDate: new Date(expiryDate),
        supplier,
      },
    });

    res.json(toFrontendItem(updated));
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    await prisma.item.delete({ where: { id: req.params.id } });
    res.json({ message: "Item deleted" });
  } catch (err) {
    next(err);
  }
};
