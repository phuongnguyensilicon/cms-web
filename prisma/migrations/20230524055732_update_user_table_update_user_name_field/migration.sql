-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `userName` VARCHAR(191) NULL;
