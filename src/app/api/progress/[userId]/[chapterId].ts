import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, chapterId } = req.query;

  if (req.method === "GET") {
    const progress = await prisma.progress.findFirst({
      where: {
        userId: String(userId),
        chapterId: String(chapterId),
      },
    });

    return res.status(200).json(progress || { topics: [], completed: false });
  }
}
