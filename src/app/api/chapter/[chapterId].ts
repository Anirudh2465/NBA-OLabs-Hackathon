import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { chapterId } = req.query;
    const chapter = await prisma.chapter.findUnique({
      where: { id: String(chapterId) },
      include: { topics: true },
    });

    if (!chapter) return res.status(404).json({ error: "Chapter not found" });
    return res.status(200).json(chapter);
  }
}
