-- AlterTable
ALTER TABLE `RelTagTitle` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Tag` ALTER COLUMN `id` DROP DEFAULT,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `MediaItem` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `overview` VARCHAR(5000) NULL,
    `releaseDate` DATETIME(3) NOT NULL,
    `tmdbId` INTEGER NOT NULL,
    `mediaType` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `posterPath` VARCHAR(1000) NULL,
    `backdropPath` VARCHAR(1000) NULL,
    `genres` VARCHAR(2000) NULL,
    `tags` VARCHAR(2000) NULL,
    `status` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaItem_tmdbId_key`(`tmdbId`),
    FULLTEXT INDEX `MediaItem_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaCreditItem` (
    `id` VARCHAR(191) NOT NULL,
    `adult` BOOLEAN NOT NULL DEFAULT true,
    `gender` INTEGER NOT NULL,
    `tmdbId` INTEGER NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `knownDepartment` VARCHAR(500) NOT NULL,
    `profilePath` VARCHAR(1000) NULL,
    `creditType` VARCHAR(191) NOT NULL,
    `job` VARCHAR(1000) NULL,
    `mediaItemId` VARCHAR(191) NOT NULL,
    `department` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaCreditItem_tmdbId_key`(`tmdbId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAdditionalItem` (
    `id` VARCHAR(191) NOT NULL,
    `tmdbId` INTEGER NOT NULL,
    `name` VARCHAR(1000) NOT NULL,
    `key` VARCHAR(500) NOT NULL,
    `size` VARCHAR(200) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mediaItemId` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaAdditionalItem_tmdbId_key`(`tmdbId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaCreditItem` ADD CONSTRAINT `MediaCreditItem_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAdditionalItem` ADD CONSTRAINT `MediaAdditionalItem_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
