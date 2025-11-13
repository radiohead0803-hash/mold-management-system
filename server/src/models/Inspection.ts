import { DataTypes, Model, Sequelize } from 'sequelize';

export interface InspectionAttributes {
  id: string;
  mold_id: string;
  due_by_shots?: number;
  due_by_date?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  result?: 'pass' | 'fail' | 'conditional';
  notes?: string;
  photos: string[];
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface InspectionModel extends Model<InspectionAttributes>, InspectionAttributes {}

export const initInspection = (sequelize: Sequelize) => {
  const Inspection = sequelize.define<InspectionModel>('inspections', {
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
    due_by_shots: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    due_by_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'overdue'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    result: {
      type: DataTypes.ENUM('pass', 'fail', 'conditional'),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return Inspection;
};
