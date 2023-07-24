-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatar` VARCHAR(1000) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `UserProvider` ALTER COLUMN `updatedAt` DROP DEFAULT;
