import { Model, Sequelize } from 'sequelize';
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
export interface DailyCheckModel extends Model<DailyCheckAttributes>, DailyCheckAttributes {
}
export declare const initDailyCheck: (sequelize: Sequelize) => import("sequelize").ModelCtor<DailyCheckModel>;
//# sourceMappingURL=DailyCheck.d.ts.map