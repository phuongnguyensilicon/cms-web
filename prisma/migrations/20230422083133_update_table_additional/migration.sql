/*
  Warnings:

  - You are about to drop the column `size` on the `mediaadditionalitem` table. All the data in the column will be lost.
  - Added the required column `site` to the `MediaAdditionalItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MediaAdditionalItem` DROP COLUMN `size`,
    ADD COLUMN `site` VARCHAR(200) NOT NULL;
