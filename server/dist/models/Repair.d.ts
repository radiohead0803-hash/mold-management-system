import { Model, Sequelize } from 'sequelize';
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
export interface RepairModel extends Model<RepairAttributes>, RepairAttributes {
}
export declare const initRepair: (sequelize: Sequelize) => import("sequelize").ModelCtor<RepairModel>;
//# sourceMappingURL=Repair.d.ts.map