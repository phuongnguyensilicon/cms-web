-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaAdditionalItem` ADD COLUMN `type` VARCHAR(191) NULL;
