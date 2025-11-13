import { DataTypes, Model, Sequelize } from 'sequelize';

export interface RepairAttributes {
  id: string;
  mold_id: string;
  symptom: string;
  cause: string;
  action_taken: string;
  status: 'requested' | 'in_progress' | 'completed' | 'cancelled';
  photos: string[];
  requested_at: Date;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface RepairModel extends Model<RepairAttributes>, RepairAttributes {}

export const initRepair = (sequelize: Sequelize) => {
  const Repair = sequelize.define<RepairModel>('repairs', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mold_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'molds',
        key: 'id',
      },
    },
    symptom: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cause: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    action_taken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('requested', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'requested',
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return Repair;
};
