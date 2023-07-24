-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `UserMediaStat` ADD COLUMN `viewGameScore` DOUBLE NULL;
