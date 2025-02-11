/*
  Warnings:

  - Added the required column `userEmail` to the `ChatMembers` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdBy` on table `Chats` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MsgStatus" AS ENUM ('DELEVIRED', 'SENT', 'READ');

-- AlterTable
ALTER TABLE "ChatMembers" ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Chats" ALTER COLUMN "createdBy" SET NOT NULL;

-- CreateTable
CREATE TABLE "MessageStatus" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "MsgStatus" NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageStatus_messageId_userId_key" ON "MessageStatus"("messageId", "userId");

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
