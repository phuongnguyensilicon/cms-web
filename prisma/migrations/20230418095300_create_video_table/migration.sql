/*
  Warnings:

  - The primary key for the `Provider` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `name` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `VarChar(250)` to `VarChar(191)`.
  - The primary key for the `Title` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `name` on the `Title` table. The data in that column could be lost. The data in that column will be cast from `VarChar(250)` to `VarChar(191)`.
  - The primary key for the `TitleMetadata` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[name]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.
  - Made the column `active` on table `Provider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Provider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Provider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `active` on table `Title` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Title` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Title` required. This step will fail if there are existing NULL values in that column.
  - Made the column `metaValue` on table `TitleMetadata` required. This step will fail if there are existing NULL values in that column.
  - Made the column `active` on table `TitleMetadata` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `TitleMetadata` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `TitleMetadata` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Title` DROP FOREIGN KEY `Title_provider_id_fkey`;

-- DropForeignKey
ALTER TABLE `TitleMetadata` DROP FOREIGN KEY `TitleMetadata_title_id_fkey`;

-- DropIndex
DROP INDEX `Title_tmdb_id_key` ON `Title`;

-- DropIndex
DROP INDEX `provider_reference` ON `Title`;

-- AlterTable
ALTER TABLE `Provider` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Title` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `providerId` VARCHAR(191) NOT NULL,
    MODIFY `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `TitleMetadata` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `metaKey` TEXT NOT NULL,
    MODIFY `metaValue` TEXT NOT NULL,
    MODIFY `titleId` VARCHAR(191) NOT NULL,
    MODIFY `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Video` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `titleId` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Provider_name_key` ON `Provider`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Title_tmdbId_key` ON `Title`(`tmdbId`);

-- CreateIndex
CREATE FULLTEXT INDEX `Title_name_idx` ON `Title`(`name`);

-- AddForeignKey
ALTER TABLE `Title` ADD CONSTRAINT `Title_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TitleMetadata` ADD CONSTRAINT `TitleMetadata_titleId_fkey` FOREIGN KEY (`titleId`) REFERENCES `Title`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_titleId_fkey` FOREIGN KEY (`titleId`) REFERENCES `Title`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
