import { Model, Sequelize } from 'sequelize';
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
export interface InspectionModel extends Model<InspectionAttributes>, InspectionAttributes {
}
export declare const initInspection: (sequelize: Sequelize) => import("sequelize").ModelCtor<InspectionModel>;
//# sourceMappingURL=Inspection.d.ts.map