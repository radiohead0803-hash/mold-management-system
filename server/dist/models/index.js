"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = exports.Notification = exports.QRSession = exports.Shot = exports.Repair = exports.Inspection = exports.DailyCheck = exports.Mold = exports.User = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const User_1 = require("./User");
const Mold_1 = require("./Mold");
const DailyCheck_1 = require("./DailyCheck");
const Inspection_1 = require("./Inspection");
const Repair_1 = require("./Repair");
const Shot_1 = require("./Shot");
const QRSession_1 = require("./QRSession");
const Notification_1 = require("./Notification");
const AuditLog_1 = require("./AuditLog");
const sequelize = new sequelize_1.Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mold_management',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    },
});
exports.sequelize = sequelize;
const User = (0, User_1.initUser)(sequelize);
exports.User = User;
const Mold = (0, Mold_1.initMold)(sequelize);
exports.Mold = Mold;
const DailyCheck = (0, DailyCheck_1.initDailyCheck)(sequelize);
exports.DailyCheck = DailyCheck;
const Inspection = (0, Inspection_1.initInspection)(sequelize);
exports.Inspection = Inspection;
const Repair = (0, Repair_1.initRepair)(sequelize);
exports.Repair = Repair;
const Shot = (0, Shot_1.initShot)(sequelize);
exports.Shot = Shot;
const QRSession = (0, QRSession_1.initQRSession)(sequelize);
exports.QRSession = QRSession;
const Notification = (0, Notification_1.initNotification)(sequelize);
exports.Notification = Notification;
const AuditLog = (0, AuditLog_1.initAuditLog)(sequelize);
exports.AuditLog = AuditLog;
User.hasMany(Mold, { foreignKey: 'created_by', as: 'createdMolds' });
Mold.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Mold.hasMany(DailyCheck, { foreignKey: 'mold_id', as: 'dailyChecks' });
DailyCheck.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
Mold.hasMany(Inspection, { foreignKey: 'mold_id', as: 'inspections' });
Inspection.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
Mold.hasMany(Repair, { foreignKey: 'mold_id', as: 'repairs' });
Repair.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
Mold.hasMany(Shot, { foreignKey: 'mold_id', as: 'shots' });
Shot.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
Mold.hasMany(QRSession, { foreignKey: 'mold_id', as: 'qrSessions' });
QRSession.belongsTo(Mold, { foreignKey: 'mold_id', as: 'mold' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
//# sourceMappingURL=index.js.map