import { Sequelize } from 'sequelize';
import { initUser } from './User';
import { initMold } from './Mold';
import { initDailyCheck } from './DailyCheck';
import { initInspection } from './Inspection';
import { initRepair } from './Repair';
import { initShot } from './Shot';
import { initQRSession } from './QRSession';
import { initNotification } from './Notification';
import { initAuditLog } from './AuditLog';

// Database connection
const sequelize = new Sequelize({
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

// Initialize models
const User = initUser(sequelize);
const Mold = initMold(sequelize);
const DailyCheck = initDailyCheck(sequelize);
const Inspection = initInspection(sequelize);
const Repair = initRepair(sequelize);
const Shot = initShot(sequelize);
const QRSession = initQRSession(sequelize);
const Notification = initNotification(sequelize);
const AuditLog = initAuditLog(sequelize);

// Define associations
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

export {
  sequelize,
  User,
  Mold,
  DailyCheck,
  Inspection,
  Repair,
  Shot,
  QRSession,
  Notification,
  AuditLog,
};

export type {
  UserModel,
  MoldModel,
  DailyCheckModel,
  InspectionModel,
  RepairModel,
  ShotModel,
  QRSessionModel,
  NotificationModel,
  AuditLogModel,
};
