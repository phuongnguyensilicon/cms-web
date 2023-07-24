-- CreateTable
CREATE TABLE `MediaListName` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(2000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaListName_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaListNameItem` (
    `id` VARCHAR(191) NOT NULL,
    `mediaListNameId` VARCHAR(191) NOT NULL,
    `mediaItemId` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaListNameItem_mediaListNameId_mediaItemId_key`(`mediaListNameId`, `mediaItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaListNameItem` ADD CONSTRAINT `MediaListNameItem_mediaListNameId_fkey` FOREIGN KEY (`mediaListNameId`) REFERENCES `MediaListName`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaListNameItem` ADD CONSTRAINT `MediaListNameItem_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
