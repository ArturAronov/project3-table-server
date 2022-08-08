/*
  Warnings:

  - A unique constraint covering the columns `[id,tableNr]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_tableId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Table_id_tableNr_key" ON "Table"("id", "tableNr");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tableId_tableNr_fkey" FOREIGN KEY ("tableId", "tableNr") REFERENCES "Table"("id", "tableNr") ON DELETE SET NULL ON UPDATE CASCADE;
