"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initInspection = void 0;
const sequelize_1 = require("sequelize");
const initInspection = (sequelize) => {
    const Inspection = sequelize.define('inspections', {
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
        due_by_shots: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        due_by_date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'overdue'),
            allowNull: false,
            defaultValue: 'scheduled',
        },
        result: {
            type: sequelize_1.DataTypes.ENUM('pass', 'fail', 'conditional'),
            allowNull: true,
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        photos: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        completed_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
    });
    return Inspection;
};
exports.initInspection = initInspection;
//# sourceMappingURL=Inspection.js.map