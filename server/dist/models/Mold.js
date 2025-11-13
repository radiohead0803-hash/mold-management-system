"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMold = void 0;
const sequelize_1 = require("sequelize");
const initMold = (sequelize) => {
    const Mold = sequelize.define('molds', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        part_number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        part_name: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
        },
        vehicle_model: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        item_type: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        manufacturer: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        investment_cost: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '투자비(천원)',
        },
        progress_stage: {
            type: sequelize_1.DataTypes.ENUM('E0', 'E1', 'E2', 'E3', 'PPAP', 'SOP'),
            allowNull: false,
        },
        manufacturing_method: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        supplier_planned: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        supplier_actual: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
        },
        completion_planned: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        completion_actual: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        cvt_quantity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: 'CVT 수량(EA)',
        },
        mold_weight: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '금형중량(톤)',
        },
        hot_runner: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        gate_count: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '게이트 수량(EA)',
        },
        shrinkage_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 3),
            allowNull: false,
            comment: '금형 수축률',
        },
        storage_location: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        storage_position: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        main_image: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        gallery_images: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
            defaultValue: [],
        },
        attachments: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
            allowNull: true,
            defaultValue: [],
        },
        qr_code: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        created_by: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
    }, {
        indexes: [
            { fields: ['part_number'] },
            { fields: ['vehicle_model'] },
            { fields: ['manufacturer'] },
            { fields: ['progress_stage'] },
            { fields: ['created_at'] },
        ],
    });
    return Mold;
};
exports.initMold = initMold;
//# sourceMappingURL=Mold.js.map