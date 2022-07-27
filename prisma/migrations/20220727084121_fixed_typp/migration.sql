/*
  Warnings:

  - You are about to drop the column `dateEdied` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "dateEdied",
ADD COLUMN     "dateEdited" TIMESTAMP(3);
