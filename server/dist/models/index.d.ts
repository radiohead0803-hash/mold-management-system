import { Sequelize } from 'sequelize';
declare const sequelize: Sequelize;
declare const User: import("sequelize").ModelCtor<import("./User").UserModel>;
declare const Mold: import("sequelize").ModelCtor<import("./Mold").MoldModel>;
declare const DailyCheck: import("sequelize").ModelCtor<import("./DailyCheck").DailyCheckModel>;
declare const Inspection: import("sequelize").ModelCtor<import("./Inspection").InspectionModel>;
declare const Repair: import("sequelize").ModelCtor<import("./Repair").RepairModel>;
declare const Shot: import("sequelize").ModelCtor<import("./Shot").ShotModel>;
declare const QRSession: import("sequelize").ModelCtor<import("./QRSession").QRSessionModel>;
declare const Notification: import("sequelize").ModelCtor<import("./Notification").NotificationModel>;
declare const AuditLog: import("sequelize").ModelCtor<import("./AuditLog").AuditLogModel>;
export { sequelize, User, Mold, DailyCheck, Inspection, Repair, Shot, QRSession, Notification, AuditLog, };
export type { UserModel, MoldModel, DailyCheckModel, InspectionModel, RepairModel, ShotModel, QRSessionModel, NotificationModel, AuditLogModel, };
//# sourceMappingURL=index.d.ts.map