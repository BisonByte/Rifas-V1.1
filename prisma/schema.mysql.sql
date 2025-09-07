-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `celular` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` VARCHAR(191) NOT NULL DEFAULT 'VENDEDOR',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rifas` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `portadaUrl` VARCHAR(191) NULL,
    `fechaSorteo` DATETIME(3) NOT NULL,
    `precioPorBoleto` DOUBLE NOT NULL,
    `precioUSD` DOUBLE NULL,
    `totalBoletos` INTEGER NOT NULL,
    `limitePorPersona` INTEGER NULL DEFAULT 10,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'BORRADOR',
    `tiempoReserva` INTEGER NOT NULL DEFAULT 30,
    `mostrarTopCompradores` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `premios` (
    `id` VARCHAR(191) NOT NULL,
    `rifaId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `orden` INTEGER NULL,
    `ticketGanadorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `premios_ticketGanadorId_key`(`ticketGanadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participantes` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `celular` VARCHAR(191) NOT NULL,
    `cedula` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `participantes_celular_key`(`celular`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `rifaId` VARCHAR(191) NOT NULL,
    `participanteId` VARCHAR(191) NULL,
    `compraId` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'DISPONIBLE',
    `monto` DOUBLE NULL,
    `fechaReserva` DATETIME(3) NULL,
    `fechaVencimiento` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tickets_numero_rifaId_key`(`numero`, `rifaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compras` (
    `id` VARCHAR(191) NOT NULL,
    `rifaId` VARCHAR(191) NOT NULL,
    `participanteId` VARCHAR(191) NOT NULL,
    `cantidadTickets` INTEGER NOT NULL DEFAULT 1,
    `monto` DOUBLE NOT NULL,
    `montoTotal` DOUBLE NOT NULL,
    `metodoPago` VARCHAR(191) NOT NULL DEFAULT 'TRANSFERENCIA',
    `estadoPago` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `voucherUrl` VARCHAR(191) NULL,
    `imagenComprobante` VARCHAR(191) NULL,
    `bancoId` VARCHAR(191) NULL,
    `referencia` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,
    `fechaVencimiento` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuentas_bancarias` (
    `id` VARCHAR(191) NOT NULL,
    `banco` VARCHAR(191) NOT NULL,
    `titular` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `tipoCuenta` VARCHAR(191) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cuentas_bancarias_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sorteos` (
    `id` VARCHAR(191) NOT NULL,
    `rifaId` VARCHAR(191) NOT NULL,
    `numeroGanador` INTEGER NULL,
    `ticketGanadorId` VARCHAR(191) NULL,
    `metodo` VARCHAR(191) NOT NULL DEFAULT 'AUTOMATICO',
    `semilla` VARCHAR(191) NULL,
    `fechaSorteo` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verificado` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sorteos_rifaId_key`(`rifaId`),
    UNIQUE INDEX `sorteos_ticketGanadorId_key`(`ticketGanadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `mensaje` VARCHAR(191) NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `usuarioId` VARCHAR(191) NULL,
    `participanteId` VARCHAR(191) NULL,
    `paraAdministradores` BOOLEAN NOT NULL DEFAULT false,
    `metadata` VARCHAR(191) NULL,
    `fechaLectura` DATETIME(3) NULL,
    `creadaPor` VARCHAR(191) NULL,
    `leidaPor` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `evento` VARCHAR(191) NOT NULL,
    `accion` VARCHAR(191) NULL,
    `usuarioId` VARCHAR(191) NULL,
    `entidad` VARCHAR(191) NULL,
    `entidadId` VARCHAR(191) NULL,
    `detalles` VARCHAR(191) NULL,
    `payload` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NULL,
    `creadaPor` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuraciones` (
    `id` VARCHAR(191) NOT NULL,
    `clave` VARCHAR(191) NOT NULL,
    `valor` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'STRING',
    `categoria` VARCHAR(191) NOT NULL DEFAULT 'GENERAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `configuraciones_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracion_sitio` (
    `id` VARCHAR(191) NOT NULL,
    `clave` VARCHAR(191) NOT NULL,
    `valor` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `configuracion_sitio_clave_key`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodos_pago` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `imagen` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `numeroCuenta` VARCHAR(191) NULL,
    `tipoCuenta` VARCHAR(191) NULL,
    `cedula` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `metodos_pago_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `redes_sociales` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `icono` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `redes_sociales_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `premios` ADD CONSTRAINT `premios_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `premios` ADD CONSTRAINT `premios_ticketGanadorId_fkey` FOREIGN KEY (`ticketGanadorId`) REFERENCES `tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `participantes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `compras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `participantes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_bancoId_fkey` FOREIGN KEY (`bancoId`) REFERENCES `cuentas_bancarias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sorteos` ADD CONSTRAINT `sorteos_rifaId_fkey` FOREIGN KEY (`rifaId`) REFERENCES `rifas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sorteos` ADD CONSTRAINT `sorteos_ticketGanadorId_fkey` FOREIGN KEY (`ticketGanadorId`) REFERENCES `tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

