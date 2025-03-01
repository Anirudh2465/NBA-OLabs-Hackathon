/*
  Warnings:

  - You are about to drop the column `topicId` on the `Progress` table. All the data in the column will be lost.
  - Added the required column `chapterId` to the `Progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_topicId_fkey";

-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "topicId",
ADD COLUMN     "chapterId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_ProgressToTopic" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgressToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProgressToTopic_B_index" ON "_ProgressToTopic"("B");

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgressToTopic" ADD CONSTRAINT "_ProgressToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgressToTopic" ADD CONSTRAINT "_ProgressToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
