import { Model, Sequelize } from 'sequelize';
export interface AuditLogAttributes {
    id: string;
    table_name: string;
    record_id: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    old_values?: object;
    new_values?: object;
    user_id?: string;
    ip_address?: string;
    user_agent?: string;
    created_at?: Date;
}
export interface AuditLogModel extends Model<AuditLogAttributes>, AuditLogAttributes {
}
export declare const initAuditLog: (sequelize: Sequelize) => import("sequelize").ModelCtor<AuditLogModel>;
//# sourceMappingURL=AuditLog.d.ts.map