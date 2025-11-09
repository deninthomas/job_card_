import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEmployee extends Document {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  minimum_wage: number;
  status: "active" | "inactive";
  is_active: boolean;
  is_deleted: boolean;
  created_by?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employee_id: { type: String, required: true, unique: true, trim: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    minimum_wage: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Keep status in sync with is_active
EmployeeSchema.pre("save", function (next) {
  (this as IEmployee).status = (this as IEmployee).is_active ? "active" : "inactive";
  next();
});

export const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);

