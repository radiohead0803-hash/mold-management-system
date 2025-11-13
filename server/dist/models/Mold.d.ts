import { Model, Sequelize } from 'sequelize';
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
export interface MoldModel extends Model<MoldAttributes>, MoldAttributes {
}
export declare const initMold: (sequelize: Sequelize) => import("sequelize").ModelCtor<MoldModel>;
//# sourceMappingURL=Mold.d.ts.map