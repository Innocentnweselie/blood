const prisma = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/password");

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    res.json({ message: "Profile updated", user: { id: updated.id, name, email } });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current, newPass } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const match = await comparePassword(current, user.password);

    if (!match) return res.status(400).json({ message: "Incorrect current password" });

    const hashed = await hashPassword(newPass);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};
