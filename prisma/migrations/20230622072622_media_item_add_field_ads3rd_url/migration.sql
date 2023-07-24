-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaItem` ADD COLUMN `ads3rdUrl` VARCHAR(1000) NULL;
