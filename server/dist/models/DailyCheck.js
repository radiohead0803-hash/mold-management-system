"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDailyCheck = void 0;
const sequelize_1 = require("sequelize");
const initDailyCheck = (sequelize) => {
    const DailyCheck = sequelize.define('daily_checks', {
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
        checklist_data: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: false,
            validate: {
                isValidChecklist(value) {
                    const requiredFields = [
                        'cleanliness', 'rust_prevention', 'cooling_leak', 'gate_wear',
                        'cavity_damage', 'ejection_pin', 'bolt_tightness', 'slide_operation',
                        'area_cleanliness', 'surface_temperature'
                    ];
                    for (const field of requiredFields) {
                        if (!value[field]) {
                            throw new Error(`Missing required field: ${field}`);
                        }
                    }
                }
            }
        },
        photos: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        gps_latitude: {
            type: sequelize_1.DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },
        gps_longitude: {
            type: sequelize_1.DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        checked_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        source: {
            type: sequelize_1.DataTypes.ENUM('qr', 'manual'),
            allowNull: false,
            defaultValue: 'qr',
        },
    }, {
        indexes: [
            { fields: ['mold_id'] },
            { fields: ['checked_at'] },
            { fields: ['source'] },
            { fields: ['mold_id', 'checked_at'] },
        ],
    });
    return DailyCheck;
};
exports.initDailyCheck = initDailyCheck;
//# sourceMappingURL=DailyCheck.js.map