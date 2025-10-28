import { Model, ObjectId, Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  referenceCode?: string;
  id: string;
  status: string;
  name: string;
  email: string;
  bio: string;
  phoneNumber: string;
  password?: string;
  privacySettings: boolean;

  // profile Details
  gender: 'Male' | 'Female' | 'Others';
  rank: string;

  referralCode: string;
  fleet: number[];
  agreements: string;
  points: number;
  balance: number;

  dateOfBirth: string;
  customerId: string;
  profile: string;
  loginWth: 'google' | 'apple' | 'facebook' | 'credentials';
  role: string; 
  address?: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  businessClassTrained: boolean;
  isDeleted: boolean;
  expireAt: Date;
  verification: {
    otp: string | number;
    expiresAt: Date;
    status: boolean;
  };
  device: {
    ip: string;
    browser: string;
    os: string;
    device: string;
    lastLogin: string;
  };
}

export interface UserModel extends Model<IUser> {
  isUserExist(email: string): Promise<IUser>;
  IsUserExistId(id: string): Promise<IUser>;
  IsUserExistUserName(userName: string): Promise<IUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
