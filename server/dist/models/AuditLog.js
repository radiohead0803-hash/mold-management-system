"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAuditLog = void 0;
const sequelize_1 = require("sequelize");
const initAuditLog = (sequelize) => {
    const AuditLog = sequelize.define('audit_logs', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        table_name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        record_id: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        action: {
            type: sequelize_1.DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
            allowNull: false,
        },
        old_values: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        new_values: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        user_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        ip_address: {
            type: sequelize_1.DataTypes.INET,
            allowNull: true,
        },
        user_agent: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        updatedAt: false,
        indexes: [
            { fields: ['table_name'] },
            { fields: ['record_id'] },
            { fields: ['action'] },
            { fields: ['user_id'] },
            { fields: ['created_at'] },
        ],
    });
    return AuditLog;
};
exports.initAuditLog = initAuditLog;
//# sourceMappingURL=AuditLog.js.map