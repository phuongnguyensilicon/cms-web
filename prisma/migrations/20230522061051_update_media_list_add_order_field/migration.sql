-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaListName` ADD COLUMN `displayOrder` INTEGER NULL;
