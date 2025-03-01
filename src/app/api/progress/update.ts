import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId, chapterId, topics, completed } = req.body;

    await prisma.progress.upsert({
      where: { id: `${userId}_${chapterId}` },
      update: { topics, completed },
      create: { userId, chapterId, topics, completed },
    });

    return res.status(200).json({ success: true });
  }
}
