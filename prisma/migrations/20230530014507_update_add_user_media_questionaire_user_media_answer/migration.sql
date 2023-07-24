/*
  Warnings:

  - You are about to drop the column `mediaItemId` on the `UserMediaAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserMediaAnswer` table. All the data in the column will be lost.
  - Added the required column `userMediaQuestionaireId` to the `UserMediaAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `UserMediaAnswer` DROP FOREIGN KEY `UserMediaAnswer_mediaItemId_fkey`;

-- DropForeignKey
ALTER TABLE `UserMediaAnswer` DROP FOREIGN KEY `UserMediaAnswer_userId_fkey`;

-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `UserMediaAnswer` DROP COLUMN `mediaItemId`,
    DROP COLUMN `userId`,
    ADD COLUMN `userMediaQuestionaireId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `UserMediaQuestionaire` (
    `id` VARCHAR(191) NOT NULL,
    `mediaItemId` VARCHAR(191) NOT NULL,
    `questionaireId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserMediaQuestionaire` ADD CONSTRAINT `UserMediaQuestionaire_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMediaQuestionaire` ADD CONSTRAINT `UserMediaQuestionaire_questionaireId_fkey` FOREIGN KEY (`questionaireId`) REFERENCES `Questionaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMediaQuestionaire` ADD CONSTRAINT `UserMediaQuestionaire_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMediaAnswer` ADD CONSTRAINT `UserMediaAnswer_userMediaQuestionaireId_fkey` FOREIGN KEY (`userMediaQuestionaireId`) REFERENCES `UserMediaQuestionaire`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
