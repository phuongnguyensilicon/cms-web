-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `UserMediaAnswer` ADD COLUMN `point` DOUBLE NULL;
