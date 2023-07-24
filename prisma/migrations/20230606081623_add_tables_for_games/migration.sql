-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- CreateTable
CREATE TABLE `RoundGame` (
    `id` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRoundGame` (
    `id` VARCHAR(191) NOT NULL,
    `roundGameId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserGenreRoundGame` (
    `id` VARCHAR(191) NOT NULL,
    `userRoundGameId` VARCHAR(191) NOT NULL,
    `genre` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserGenreMediaRoundGame` (
    `id` VARCHAR(191) NOT NULL,
    `userGenreRoundGameId` VARCHAR(191) NOT NULL,
    `mediaItemId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserGenreMediaDetailRoundGame` (
    `id` VARCHAR(191) NOT NULL,
    `userGenreMediaRoundGameId` VARCHAR(191) NOT NULL,
    `watchScore` DOUBLE NULL,
    `rateScore` DOUBLE NULL,
    `likeScore` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRoundGame` ADD CONSTRAINT `UserRoundGame_roundGameId_fkey` FOREIGN KEY (`roundGameId`) REFERENCES `RoundGame`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoundGame` ADD CONSTRAINT `UserRoundGame_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserGenreRoundGame` ADD CONSTRAINT `UserGenreRoundGame_userRoundGameId_fkey` FOREIGN KEY (`userRoundGameId`) REFERENCES `UserRoundGame`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserGenreMediaRoundGame` ADD CONSTRAINT `UserGenreMediaRoundGame_userGenreRoundGameId_fkey` FOREIGN KEY (`userGenreRoundGameId`) REFERENCES `UserGenreRoundGame`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserGenreMediaDetailRoundGame` ADD CONSTRAINT `UserGenreMediaDetailRoundGame_userGenreMediaRoundGameId_fkey` FOREIGN KEY (`userGenreMediaRoundGameId`) REFERENCES `UserGenreMediaRoundGame`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
