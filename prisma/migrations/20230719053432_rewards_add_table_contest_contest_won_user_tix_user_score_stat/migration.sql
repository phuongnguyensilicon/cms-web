-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- CreateTable
CREATE TABLE `Contest` (
    `id` VARCHAR(191) NOT NULL,
    `prizeValue` DOUBLE NULL,
    `status` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContestWonStat` (
    `id` VARCHAR(191) NOT NULL,
    `contestId` VARCHAR(191) NOT NULL,
    `userTixId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserTix` (
    `id` VARCHAR(191) NOT NULL,
    `numberCode` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `val` DOUBLE NULL,
    `contestId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserScoreStat` (
    `id` VARCHAR(191) NOT NULL,
    `totalPoint` DOUBLE NULL,
    `totalUsedPoint` DOUBLE NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserScoreStat_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContestWonStat` ADD CONSTRAINT `ContestWonStat_contestId_fkey` FOREIGN KEY (`contestId`) REFERENCES `Contest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContestWonStat` ADD CONSTRAINT `ContestWonStat_userTixId_fkey` FOREIGN KEY (`userTixId`) REFERENCES `UserTix`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTix` ADD CONSTRAINT `UserTix_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTix` ADD CONSTRAINT `UserTix_contestId_fkey` FOREIGN KEY (`contestId`) REFERENCES `Contest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserScoreStat` ADD CONSTRAINT `UserScoreStat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
