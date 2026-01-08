import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  try {
    const items = await prisma.item.findMany();
    return res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
