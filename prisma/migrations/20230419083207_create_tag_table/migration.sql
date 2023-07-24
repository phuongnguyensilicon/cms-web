/*
  Warnings:

  - Made the column `synopsis` on table `Title` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Title` MODIFY `synopsis` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) DEFAULT (uuid()),
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RelTagTitle` (
    `titleId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`titleId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TagToTitle` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_TagToTitle_AB_unique`(`A`, `B`),
    INDEX `_TagToTitle_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Tag_name_key` ON `Tag`(`name`);

-- AddForeignKey
ALTER TABLE `RelTagTitle` ADD CONSTRAINT `RelTagTitle_titleId_fkey` FOREIGN KEY (`titleId`) REFERENCES `Title`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelTagTitle` ADD CONSTRAINT `RelTagTitle_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TagToTitle` ADD CONSTRAINT `_TagToTitle_A_fkey` FOREIGN KEY (`A`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TagToTitle` ADD CONSTRAINT `_TagToTitle_B_fkey` FOREIGN KEY (`B`) REFERENCES `Title`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- init the sample data
INSERT INTO Tag (name) VALUES ('Drama'),('Action'),('Fantasy'),('Horror'),('Thriller'),('Mystery'),('Comedy');