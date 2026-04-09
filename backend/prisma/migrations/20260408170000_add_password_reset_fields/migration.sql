ALTER TABLE `Usuario`
    ADD COLUMN `resetPasswordToken` VARCHAR(191) NULL,
    ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL;

CREATE INDEX `Usuario_resetPasswordToken_idx` ON `Usuario`(`resetPasswordToken`);
CREATE INDEX `Usuario_resetPasswordExpires_idx` ON `Usuario`(`resetPasswordExpires`);
