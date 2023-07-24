-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaWatchProvider` ADD COLUMN `isSelected` BOOLEAN NULL;
