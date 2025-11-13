"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNotification = void 0;
const sequelize_1 = require("sequelize");
const initNotification = (sequelize) => {
    const Notification = sequelize.define('notifications', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        title: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('info', 'warning', 'error', 'success'),
            allowNull: false,
            defaultValue: 'info',
        },
        is_read: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    });
    return Notification;
};
exports.initNotification = initNotification;
//# sourceMappingURL=Notification.js.map