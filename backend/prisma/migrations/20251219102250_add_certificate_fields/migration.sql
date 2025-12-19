/*
  Warnings:

  - A unique constraint covering the columns `[certificateNo]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `certificateNo` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "certificateNo" TEXT NOT NULL,
ADD COLUMN     "fileUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNo_key" ON "Certificate"("certificateNo");
