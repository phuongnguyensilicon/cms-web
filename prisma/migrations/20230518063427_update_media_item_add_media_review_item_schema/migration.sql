-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaItem` ADD COLUMN `budget` DOUBLE NULL,
    ADD COLUMN `keywords` TEXT NULL,
    ADD COLUMN `originalLanguage` VARCHAR(191) NULL,
    ADD COLUMN `productionCountries` TEXT NULL,
    ADD COLUMN `revenue` DOUBLE NULL,
    ADD COLUMN `socialInfos` TEXT NULL,
    ADD COLUMN `tagline` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `MediaReviewItem` (
    `id` VARCHAR(191) NOT NULL,
    `author` VARCHAR(500) NOT NULL,
    `authorDetails` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `url` VARCHAR(191) NULL,
    `mediaItemId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaReviewItem` ADD CONSTRAINT `MediaReviewItem_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
