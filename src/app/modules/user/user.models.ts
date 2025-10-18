import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import { IUser, UserModel } from './user.interface';
import { Login_With, Role, USER_ROLE } from './user.constants';
import generateCryptoString from '../../utils/generateCryptoString';

const userSchema = new Schema<IUser>(
  {
    // Basic info
    id: {
      type: String,
      default: () => generateCryptoString(8),
    },

    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: (props: any) => `${props.value} is not a valid email!`,
      },
    },

    password: {
      type: String,
      required: false,
      select: false, // Don't return password by default
    },

    role: {
      type: String,
      enum: Object.values(Role),
      default: USER_ROLE.user,
    },

    // Profile info
    profile: { type: String, default: null },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Others'],
      default: null,
    },

    dateOfBirth: { type: String, default: null },

    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // allow multiple null values
      trim: true,
      validate: {
        validator: (v: string) => !v || /^(\+?\d{8,15})$/.test(v),
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
      default: null,
    },

    address: { type: String, default: null },

    // Extra info
    customerId: { type: String, default: null },
    privacySettings: { type: Boolean, default: true },
    bio: { type: String, default: null },
    rank: { type: String, default: null },

    fleet: [
      {
        type: Number,
        enum: [797, 777, 787, 350, 380],
      },
    ],

    agreements: { type: String, default: null },

    referralCode: {
      type: String,
      default: () => generateCryptoString(8),
      unique: true,
    },

    balance: { type: Number, default: 0 },
    points: { type: Number, default: 0 },

    // Auth info
    loginWth: {
      type: String,
      enum: Object.values(Login_With),
      default: Login_With.credentials,
    },

    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },

    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 20 * 60 * 1000), // 20 min from now
    },

    needsPasswordChange: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    verification: {
      otp: {
        type: Schema.Types.Mixed,
        default: 0,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },

    device: {
      ip: String,
      browser: String,
      os: String,
      device: String,
      lastLogin: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// 🔹 TTL index for expireAt (e.g., temporary users)
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

/* --------------------------- PASSWORD HASHING --------------------------- */
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

/* --------------------------- PASSWORD HIDE AFTER SAVE --------------------------- */
userSchema.post('save', function (doc, next) {
  doc.password = undefined;
  next();
});

/* --------------------------- STATIC METHODS --------------------------- */
userSchema.statics.isUserExist = async function (email: string) {
  return await this.findOne({ email }).select('+password');
};

userSchema.statics.IsUserExistId = async function (id: string) {
  return await this.findById(id).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

/* --------------------------- MODEL EXPORT --------------------------- */
export const User = model<IUser, UserModel>('User', userSchema);
