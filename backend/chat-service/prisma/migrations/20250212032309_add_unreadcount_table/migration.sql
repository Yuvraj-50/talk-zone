/*
  Warnings:

  - You are about to drop the `MessageStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MessageStatus" DROP CONSTRAINT "MessageStatus_messageId_fkey";

-- DropTable
DROP TABLE "MessageStatus";

-- CreateTable
CREATE TABLE "UnreadCount" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UnreadCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnreadCount_chatId_userId_key" ON "UnreadCount"("chatId", "userId");

-- AddForeignKey
ALTER TABLE "UnreadCount" ADD CONSTRAINT "UnreadCount_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
