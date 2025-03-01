import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { subjectId } = req.query;
    const subject = await prisma.subject.findUnique({
      where: { id: String(subjectId) },
      include: { chapters: true },
    });

    if (!subject) return res.status(404).json({ error: "Subject not found" });
    return res.status(200).json(subject);
  }
}
