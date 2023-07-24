/*
  Warnings:

  - You are about to drop the `UserGenreMediaDetailRoundGame` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UserGenreMediaDetailRoundGame` DROP FOREIGN KEY `UserGenreMediaDetailRoundGame_userGenreMediaRoundGameId_fkey`;

-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `Questionaire` ADD COLUMN `rateScore` DOUBLE NULL,
    ADD COLUMN `selectScore` DOUBLE NULL;

-- DropTable
DROP TABLE `UserGenreMediaDetailRoundGame`;

-- CreateTable
CREATE TABLE `UserMediaStat` (
    `id` VARCHAR(191) NOT NULL,
    `userGenreMediaRoundGameId` VARCHAR(191) NULL,
    `mediaItemId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `selectScore` DOUBLE NULL,
    `viewAdsScore` DOUBLE NULL,
    `rateScore` DOUBLE NULL,
    `likePoints` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserMediaStat` ADD CONSTRAINT `UserMediaStat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMediaStat` ADD CONSTRAINT `UserMediaStat_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMediaStat` ADD CONSTRAINT `UserMediaStat_userGenreMediaRoundGameId_fkey` FOREIGN KEY (`userGenreMediaRoundGameId`) REFERENCES `UserGenreMediaRoundGame`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
