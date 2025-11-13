"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDemoUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const models_1 = require("../models");
const createDemoUsers = async () => {
    try {
        console.log('Creating demo users...');
        const existingAdmin = await models_1.User.findOne({ where: { username: 'admin' } });
        const existingManager = await models_1.User.findOne({ where: { username: 'manager' } });
        if (!existingAdmin) {
            const adminPasswordHash = await bcrypt_1.default.hash('admin123', 10);
            await models_1.User.create({
                username: 'admin',
                email: 'admin@moldmanagement.com',
                password_hash: adminPasswordHash,
                full_name: '시스템 관리자',
                role: 'admin',
                department: 'IT',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            });
            console.log('✅ Admin user created: admin / admin123');
        }
        else {
            console.log('ℹ️ Admin user already exists');
        }
        if (!existingManager) {
            const managerPasswordHash = await bcrypt_1.default.hash('manager123', 10);
            await models_1.User.create({
                username: 'manager',
                email: 'manager@moldmanagement.com',
                password_hash: managerPasswordHash,
                full_name: '생산 관리자',
                role: 'manager',
                department: '생산부',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            });
            console.log('✅ Manager user created: manager / manager123');
        }
        else {
            console.log('ℹ️ Manager user already exists');
        }
        console.log('Demo users setup completed!');
    }
    catch (error) {
        console.error('Error creating demo users:', error);
    }
};
exports.createDemoUsers = createDemoUsers;
//# sourceMappingURL=createDemoUsers.js.map