-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaItemCompareSync` ADD COLUMN `isRead` BOOLEAN NULL;
