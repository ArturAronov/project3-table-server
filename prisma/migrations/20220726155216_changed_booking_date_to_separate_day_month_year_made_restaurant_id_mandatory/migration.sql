/*
  Warnings:

  - You are about to drop the column `date` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `day` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `restaurantId` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "date",
ADD COLUMN     "day" TEXT NOT NULL,
ADD COLUMN     "month" TEXT NOT NULL,
ADD COLUMN     "year" TEXT NOT NULL,
ALTER COLUMN "restaurantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
