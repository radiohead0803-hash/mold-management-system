"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initShot = void 0;
const sequelize_1 = require("sequelize");
const initShot = (sequelize) => {
    const Shot = sequelize.define('shots', {
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
        count_delta: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '증가된 타수',
        },
        count_total: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '누적 타수',
        },
        run_state: {
            type: sequelize_1.DataTypes.ENUM('running', 'stopped', 'maintenance'),
            allowNull: false,
        },
        downtime_reason: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
        },
        recorded_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
    });
    return Shot;
};
exports.initShot = initShot;
//# sourceMappingURL=Shot.js.map