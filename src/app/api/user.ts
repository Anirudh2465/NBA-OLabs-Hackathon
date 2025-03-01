import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { userId } = req.query;
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      include: { class: true, progress: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json(user);
  }
}
