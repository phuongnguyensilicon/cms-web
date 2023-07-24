-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- CreateTable
CREATE TABLE `MediaRecommendation` (
    `id` VARCHAR(191) NOT NULL,
    `mediaItemId` VARCHAR(191) NOT NULL,
    `recommendationMediaItemId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaRecommendation` ADD CONSTRAINT `MediaRecommendation_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaRecommendation` ADD CONSTRAINT `MediaRecommendation_recommendationMediaItemId_fkey` FOREIGN KEY (`recommendationMediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
