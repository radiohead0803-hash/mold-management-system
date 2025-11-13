import { Model, Sequelize } from 'sequelize';
export interface UserAttributes {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    full_name: string;
    role: 'admin' | 'manager' | 'operator';
    department: string;
    is_active: boolean;
    last_login?: Date;
    created_at?: Date;
    updated_at?: Date;
}
export interface UserModel extends Model<UserAttributes>, UserAttributes {
}
export declare const initUser: (sequelize: Sequelize) => import("sequelize").ModelCtor<UserModel>;
//# sourceMappingURL=User.d.ts.map