/*
  Warnings:

  - You are about to drop the `MediaRecommendation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MediaRecommendation` DROP FOREIGN KEY `MediaRecommendation_mediaItemId_fkey`;

-- DropForeignKey
ALTER TABLE `MediaRecommendation` DROP FOREIGN KEY `MediaRecommendation_recommendationMediaItemId_fkey`;

-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- DropTable
DROP TABLE `MediaRecommendation`;
