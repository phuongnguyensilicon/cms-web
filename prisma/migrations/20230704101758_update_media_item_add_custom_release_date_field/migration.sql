-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaItem` ADD COLUMN `customReleaseDate` DATETIME(3) NULL;
