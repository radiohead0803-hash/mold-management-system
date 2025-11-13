"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initQRSession = void 0;
const sequelize_1 = require("sequelize");
const initQRSession = (sequelize) => {
    const QRSession = sequelize.define('qr_sessions', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        mold_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'molds',
                key: 'id',
            },
        },
        session_token: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        expires_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        indexes: [
            { fields: ['session_token'] },
            { fields: ['mold_id'] },
            { fields: ['expires_at'] },
            { fields: ['is_active'] },
        ],
    });
    return QRSession;
};
exports.initQRSession = initQRSession;
//# sourceMappingURL=QRSession.js.map