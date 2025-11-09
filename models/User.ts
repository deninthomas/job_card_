// models/user.model.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  passwordHash: string;             // stored hash
  password?: string;                // virtual only
  role: Types.ObjectId;
  phone?: string;
  is_active: boolean;
  is_deleted: boolean;
  status: "active" | "inactive";
  created_by?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // instance methods
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // store the hash here
    passwordHash: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    phone: { type: String },
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

// Virtual password field setter - allows setting password which will be hashed
UserSchema.virtual("password").set(function (this: IUser, password: string) {
  this.passwordHash = password; // Temporarily store, will be hashed in pre-save
});

// Pre-save hook to automatically hash password when it's modified
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Instance method to compare plaintext password with stored hash
UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Keep status in sync with is_active
UserSchema.pre("save", function (next) {
  (this as IUser).status = (this as IUser).is_active ? "active" : "inactive";
  next();
});



export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
