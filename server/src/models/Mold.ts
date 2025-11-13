import { DataTypes, Model, Sequelize } from 'sequelize';

export interface MoldAttributes {
  id: string;
  part_number: string;
  part_name: string;
  vehicle_model: string;
  item_type: string;
  manufacturer: string;
  investment_cost: number;
  progress_stage: string;
  manufacturing_method: string;
  supplier_planned: string;
  supplier_actual?: string;
  completion_planned: Date;
  completion_actual?: Date;
  cvt_quantity: number;
  mold_weight: number;
  hot_runner: boolean;
  gate_count: number;
  shrinkage_rate: number;
  storage_location: string;
  storage_position: string;
  main_image?: string;
  gallery_images?: string[];
  attachments?: string[];
  qr_code?: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface MoldModel extends Model<MoldAttributes>, MoldAttributes {}

export const initMold = (sequelize: Sequelize) => {
  const Mold = sequelize.define<MoldModel>('molds', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    part_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    part_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    vehicle_model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    item_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    investment_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '투자비(천원)',
    },
    progress_stage: {
      type: DataTypes.ENUM('E0', 'E1', 'E2', 'E3', 'PPAP', 'SOP'),
      allowNull: false,
    },
    manufacturing_method: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    supplier_planned: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    supplier_actual: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    completion_planned: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completion_actual: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cvt_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'CVT 수량(EA)',
    },
    mold_weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '금형중량(톤)',
    },
    hot_runner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    gate_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '게이트 수량(EA)',
    },
    shrinkage_rate: {
      type: DataTypes.DECIMAL(5, 3),
      allowNull: false,
      comment: '금형 수축률',
    },
    storage_location: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    storage_position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    main_image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gallery_images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    indexes: [
      { fields: ['part_number'] },
      { fields: ['vehicle_model'] },
      { fields: ['manufacturer'] },
      { fields: ['progress_stage'] },
      { fields: ['created_at'] },
    ],
  });

  return Mold;
};
