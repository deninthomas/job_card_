import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IModulePermission {
    module: string; // e.g., "users", "jobs", "roles"
    actions: string[]; // e.g., ["read", "create", "update", "delete"]
}

export interface IRole extends Document {
    name: string;
    description?: string;
    modules: IModulePermission[];
    status: "active" | "inactive";
    is_active: boolean;
    is_deleted: boolean;
    created_by?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ModulePermissionSchema = new Schema<IModulePermission>({
    module: { type: String, required: true },
    actions: { type: [String], required: true, default: [] },
});

const RoleSchema = new Schema<IRole>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String },
        modules: { type: [ModulePermissionSchema], default: [] },

        // --- New Fields ---
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const Roles: Model<IRole> =
    mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
