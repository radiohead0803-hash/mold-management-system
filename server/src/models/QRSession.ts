import { DataTypes, Model, Sequelize } from 'sequelize';

export interface QRSessionAttributes {
  id: string;
  mold_id: string;
  session_token: string;
  expires_at: Date;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface QRSessionModel extends Model<QRSessionAttributes>, QRSessionAttributes {}

export const initQRSession = (sequelize: Sequelize) => {
  const QRSession = sequelize.define<QRSessionModel>('qr_sessions', {
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
    session_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    indexes: [
      { fields: ['session_token'] },
      { fields: ['mold_id'] },
      { fields: ['expires_at'] },
      { fields: ['is_active'] },
    ],
  });

  return QRSession;
};
