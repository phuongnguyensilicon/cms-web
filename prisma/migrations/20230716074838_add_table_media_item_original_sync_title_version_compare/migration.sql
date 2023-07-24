-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- CreateTable
CREATE TABLE `SyncTitleVersion` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SyncTitleVersion_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaItemOriginal` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `overview` VARCHAR(5000) NULL,
    `releaseDate` DATETIME(3) NULL,
    `tmdbId` INTEGER NOT NULL,
    `mediaType` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `posterPath` VARCHAR(1000) NULL,
    `backdropPath` VARCHAR(1000) NULL,
    `genres` VARCHAR(2000) NULL,
    `tags` VARCHAR(2000) NULL,
    `status` VARCHAR(100) NULL,
    `certification` VARCHAR(191) NULL,
    `voteAverage` DOUBLE NULL,
    `runtime` INTEGER NULL,
    `numberEpisodes` INTEGER NULL,
    `numberSeasons` INTEGER NULL,
    `originalLanguage` VARCHAR(191) NULL,
    `tagline` VARCHAR(191) NULL,
    `budget` DOUBLE NULL,
    `revenue` DOUBLE NULL,
    `keywords` TEXT NULL,
    `socialInfos` TEXT NULL,
    `productionCountries` TEXT NULL,
    `credits` TEXT NULL,
    `videos` TEXT NULL,
    `watchs` TEXT NULL,
    `ads3rdUrl` VARCHAR(1000) NULL,
    `syncTitleVersionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    FULLTEXT INDEX `MediaItemOriginal_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaItemCompareSync` (
    `id` VARCHAR(191) NOT NULL,
    `mediaItemId` VARCHAR(191) NOT NULL,
    `diffChanges` TEXT NOT NULL,
    `syncTitleVersionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaItemOriginal` ADD CONSTRAINT `MediaItemOriginal_syncTitleVersionId_fkey` FOREIGN KEY (`syncTitleVersionId`) REFERENCES `SyncTitleVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaItemCompareSync` ADD CONSTRAINT `MediaItemCompareSync_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaItemCompareSync` ADD CONSTRAINT `MediaItemCompareSync_syncTitleVersionId_fkey` FOREIGN KEY (`syncTitleVersionId`) REFERENCES `SyncTitleVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
