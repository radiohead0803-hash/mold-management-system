"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUser = void 0;
const sequelize_1 = require("sequelize");
const initUser = (sequelize) => {
    const User = sequelize.define('users', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        full_name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        role: {
            type: sequelize_1.DataTypes.ENUM('admin', 'manager', 'operator'),
            allowNull: false,
            defaultValue: 'operator',
        },
        department: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        last_login: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
    }, {
        indexes: [
            { fields: ['username'] },
            { fields: ['email'] },
            { fields: ['role'] },
            { fields: ['is_active'] },
        ],
    });
    return User;
};
exports.initUser = initUser;
//# sourceMappingURL=User.js.map