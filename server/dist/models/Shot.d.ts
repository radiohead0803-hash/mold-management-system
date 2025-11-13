import { Model, Sequelize } from 'sequelize';
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
export interface ShotModel extends Model<ShotAttributes>, ShotAttributes {
}
export declare const initShot: (sequelize: Sequelize) => import("sequelize").ModelCtor<ShotModel>;
//# sourceMappingURL=Shot.d.ts.map