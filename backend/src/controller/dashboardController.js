const prisma = require("../config/db");

exports.getDashboard = async (req, res, next) => {
  try {
    const items = await prisma.item.findMany();

    const totalStock = items.reduce((sum, i) => sum + i.quantity, 0);
    const lowStock = items.filter((i) => i.quantity < i.reorderLevel).length;
    const outOfStock = items.filter((i) => i.quantity === 0).length;

    const now = new Date();
    const expiringSoon = items.filter((i) => {
      const diff = (new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 30;
    }).length;

    const alerts = [];
    if (outOfStock > 0) alerts.push(`${outOfStock} items are out of stock`);
    if (expiringSoon > 0) alerts.push(`${expiringSoon} items expire within 30 days`);
    if (lowStock > 0) alerts.push(`${lowStock} items are below minimum quantity`);

    const cards = [
      { title: "Total Stock", count: totalStock },
      { title: "Low Stock", count: lowStock },
      { title: "Out of Stock", count: outOfStock },
      { title: "Expiring Soon", count: expiringSoon },
    ];

    const inventory = items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      expirationDate: i.expiryDate,
      supplier: i.supplier,
    }));

    res.json({ cards, alerts, inventory });
  } catch (err) {
    next(err);
  }
};
