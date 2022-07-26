/*
  Warnings:

  - You are about to drop the column `capacity` on the `Table` table. All the data in the column will be lost.
  - Added the required column `maxCapacity` to the `Table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minCapacity` to the `Table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Table" DROP COLUMN "capacity",
ADD COLUMN     "maxCapacity" INTEGER NOT NULL,
ADD COLUMN     "minCapacity" INTEGER NOT NULL;
