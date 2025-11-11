import mongoose, { Schema, Document, Model, Types } from "mongoose";



export interface IDocument extends Document {
    file_name: string;
    file_size: number;
    file_type: string;
    s3_path?: string;
    is_active: boolean;
    is_deleted: boolean;
    created_by?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}



const DocumentSchema = new Schema<IDocument>(
    {
        file_name: { type: String, required: true },
        file_size: { type: Number, required: true },
        file_type: { type: String, required: true },
        s3_path: { type: String },
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const Roles: Model<IDocument> =
    mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
