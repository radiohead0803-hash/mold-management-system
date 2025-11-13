import { DataTypes, Model, Sequelize } from 'sequelize';

export interface ShotAttributes {
  id: string;
  mold_id: string;
  count_delta: number;
  count_total: number;
  run_state: 'running' | 'stopped' | 'maintenance';
  downtime_reason?: string;
  recorded_at: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShotModel extends Model<ShotAttributes>, ShotAttributes {}

export const initShot = (sequelize: Sequelize) => {
  const Shot = sequelize.define<ShotModel>('shots', {
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
    count_delta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '증가된 타수',
    },
    count_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '누적 타수',
    },
    run_state: {
      type: DataTypes.ENUM('running', 'stopped', 'maintenance'),
      allowNull: false,
    },
    downtime_reason: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  return Shot;
};
