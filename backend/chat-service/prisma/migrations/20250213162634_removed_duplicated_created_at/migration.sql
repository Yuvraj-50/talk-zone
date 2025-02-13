/*
  Warnings:

  - You are about to drop the column `created_at` on the `Chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "created_at";

-- DropEnum
DROP TYPE "MsgStatus";
