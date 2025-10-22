import { Model } from 'mongoose';

export interface IGiftCard {
  brand: string;
  denomination: number;
  pointsRequired: number;
  status: boolean;
  description: string;
  logo: string;
  isDeleted: boolean;
}

export type IGiftCardModules = Model<IGiftCard, Record<string, unknown>>;
