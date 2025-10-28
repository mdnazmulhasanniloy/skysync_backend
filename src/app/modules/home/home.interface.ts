
import { Model } from 'mongoose';

export interface IHome {}

export type IHomeModules = Model<IHome, Record<string, unknown>>;