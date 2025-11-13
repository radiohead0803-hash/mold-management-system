"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRepair = void 0;
const sequelize_1 = require("sequelize");
const initRepair = (sequelize) => {
    const Repair = sequelize.define('repairs', {
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
        symptom: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        cause: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        action_taken: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('requested', 'in_progress', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'requested',
        },
        photos: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        requested_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        completed_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
    });
    return Repair;
};
exports.initRepair = initRepair;
//# sourceMappingURL=Repair.js.map