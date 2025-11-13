import { Model, Sequelize } from 'sequelize';
export interface QRSessionAttributes {
    id: string;
    mold_id: string;
    session_token: string;
    expires_at: Date;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
export interface QRSessionModel extends Model<QRSessionAttributes>, QRSessionAttributes {
}
export declare const initQRSession: (sequelize: Sequelize) => import("sequelize").ModelCtor<QRSessionModel>;
//# sourceMappingURL=QRSession.d.ts.map