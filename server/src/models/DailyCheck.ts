import { DataTypes, Model, Sequelize } from 'sequelize';

export interface DailyCheckAttributes {
  id: string;
  mold_id: string;
  checklist_data: {
    cleanliness: 'good' | 'bad';
    rust_prevention: 'applied' | 'not_applied';
    cooling_leak: 'good' | 'bad';
    gate_wear: 'good' | 'bad';
    cavity_damage: 'good' | 'bad';
    ejection_pin: 'good' | 'bad';
    bolt_tightness: 'good' | 'bad';
    slide_operation: 'good' | 'bad';
    area_cleanliness: 'good' | 'bad';
    surface_temperature: 'normal' | 'abnormal';
  };
  photos: string[];
  gps_latitude?: number;
  gps_longitude?: number;
  notes?: string;
  checked_at: Date;
  source: 'qr' | 'manual';
  created_at?: Date;
  updated_at?: Date;
}

export interface DailyCheckModel extends Model<DailyCheckAttributes>, DailyCheckAttributes {}

export const initDailyCheck = (sequelize: Sequelize) => {
  const DailyCheck = sequelize.define<DailyCheckModel>('daily_checks', {
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
    checklist_data: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidChecklist(value: any) {
          const requiredFields = [
            'cleanliness', 'rust_prevention', 'cooling_leak', 'gate_wear',
            'cavity_damage', 'ejection_pin', 'bolt_tightness', 'slide_operation',
            'area_cleanliness', 'surface_temperature'
          ];
          
          for (const field of requiredFields) {
            if (!value[field]) {
              throw new Error(`Missing required field: ${field}`);
            }
          }
        }
      }
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    gps_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    gps_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    checked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    source: {
      type: DataTypes.ENUM('qr', 'manual'),
      allowNull: false,
      defaultValue: 'qr',
    },
  }, {
    indexes: [
      { fields: ['mold_id'] },
      { fields: ['checked_at'] },
      { fields: ['source'] },
      { fields: ['mold_id', 'checked_at'] },
    ],
  });

  return DailyCheck;
};
