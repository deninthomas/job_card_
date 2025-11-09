import mongoose, { Schema, Document, models } from "mongoose";

export interface IAction {
    name: string;
    key: string;
}

export interface IModule extends Document {
    name: string;
    key: string;
    actions: IAction[];
}

const ActionSchema = new Schema<IAction>({
    name: { type: String, required: true },
    key: { type: String, required: true },
});

const ModuleSchema = new Schema<IModule>({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    actions: [ActionSchema],
});

export default models.Module || mongoose.model<IModule>("Module", ModuleSchema);
