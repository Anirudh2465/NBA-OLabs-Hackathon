import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { classId } = req.query;
    const classData = await prisma.class.findUnique({
      where: { id: String(classId) },
      include: { subjects: true },
    });

    if (!classData) return res.status(404).json({ error: "Class not found" });
    return res.status(200).json(classData);
  }
}
