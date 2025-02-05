/*
  Warnings:

  - Added the required column `userName` to the `ChatMembers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMembers" ADD COLUMN     "userName" TEXT NOT NULL;
