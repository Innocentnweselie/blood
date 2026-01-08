import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item)
      return res.status(404).json({ error: "Item not found" });

    return res.status(200).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch item" });
  }
}
