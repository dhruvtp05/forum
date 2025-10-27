// server/src/models/User.ts
import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcrypt';

interface User {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<User, {}, UserMethods>;
type UserDoc = HydratedDocument<User, UserMethods>;

const userSchema = new Schema<User, UserModel, UserMethods>({
  username: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  password: { type: String, required: true, select: false }, // hide by default
});

// Hash on create/save when password changed
userSchema.pre('save', async function (this: UserDoc, next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = Number(process.env.BCRYPT_COST ?? 10);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err as any);
  }
});

// Hash on findOneAndUpdate if password provided via query update
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  // Support both $set.password and direct password
  const pwd = update?.password ?? update?.$set?.password;
  if (!pwd) return next();
  try {
    const saltRounds = Number(process.env.BCRYPT_COST ?? 10);
    const hashed = await bcrypt.hash(pwd, saltRounds);
    if (update.$set && 'password' in (update.$set as any)) {
      update.$set.password = hashed;
    } else {
      update.password = hashed;
    }
    next();
  } catch (err) {
    next(err as any);
  }
});

// Instance method
userSchema.method('comparePassword', async function comparePassword(this: UserDoc, candidate: string) {
  // Ensure this.password is available; load with .select('+password') when querying
  return bcrypt.compare(candidate, this.password);
});

const UserModel = mongoose.model<User, UserModel>('User', userSchema);
export default UserModel;
export type { User, UserDoc };
