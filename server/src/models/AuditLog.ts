import { DataTypes, Model, Sequelize } from 'sequelize';

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

export interface AuditLogModel extends Model<AuditLogAttributes>, AuditLogAttributes {}

export const initAuditLog = (sequelize: Sequelize) => {
  const AuditLog = sequelize.define<AuditLogModel>('audit_logs', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    record_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false,
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    updatedAt: false,
    indexes: [
      { fields: ['table_name'] },
      { fields: ['record_id'] },
      { fields: ['action'] },
      { fields: ['user_id'] },
      { fields: ['created_at'] },
    ],
  });

  return AuditLog;
};
