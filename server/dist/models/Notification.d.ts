import { Model, Sequelize } from 'sequelize';
export interface NotificationAttributes {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    is_read: boolean;
    created_at?: Date;
    updated_at?: Date;
}
export interface NotificationModel extends Model<NotificationAttributes>, NotificationAttributes {
}
export declare const initNotification: (sequelize: Sequelize) => import("sequelize").ModelCtor<NotificationModel>;
//# sourceMappingURL=Notification.d.ts.map