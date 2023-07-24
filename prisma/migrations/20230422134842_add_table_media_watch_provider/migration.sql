-- CreateTable
CREATE TABLE `MediaWatchProvider` (
    `id` VARCHAR(191) NOT NULL,
    `tmdbId` INTEGER NOT NULL,
    `logoPath` VARCHAR(1000) NOT NULL,
    `providerId` INTEGER NULL,
    `providerName` VARCHAR(200) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mediaItemId` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaWatchProvider` ADD CONSTRAINT `MediaWatchProvider_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
