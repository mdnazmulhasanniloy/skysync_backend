import httpStatus from 'http-status';
import { IWithdraw } from './withdraw.interface';
import Withdraw from './withdraw.models';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import { User } from '../user/user.models';
import moment from 'moment';
import QueryBuilder from '../../core/builder/QueryBuilder';

const createWithdraw = async (payload: IWithdraw) => {
  const user = await User.findById(payload?.user);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found!');
  }
  const createdAt = user.createdAt;
  const probationStart = moment(createdAt);
  const probationEnd = moment(createdAt).add(3, 'months');
  const withdrawEnd = moment(createdAt).add(4, 'months');
  const now = moment();
  const remainingDays = probationEnd.diff(now, 'days');

  const isInProbation = now.isBetween(
    probationStart,
    probationEnd,
    'day',
    '[]',
  );
  const isInWithdraw = now.isBetween(probationEnd, withdrawEnd, 'day', '[]');

  if (isInProbation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You’re still in your probation period. ${remainingDays} days left before withdrawal.`,
    );
  }

  if (!isInWithdraw) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Your withdrawal time is ended.',
    );
  }

  if (user?.balance < payload.amount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance');
  }

  const result = await Withdraw.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create withdraw');
  }

  return result;
};

const getAllWithdraw = async (query: Record<string, any>) => {
  const withdrawModel = new QueryBuilder(
    Withdraw.find({ isDeleted: false }),
    query,
  )
    .search(['status'])
    .conditionalFilter()
    .paginate()
    .sort()
    .fields();

  const data = await withdrawModel.modelQuery;
  const meta = await withdrawModel.countTotal();

  return {
    data,
    meta,
  };
};

const getWithdrawById = async (id: string) => {
  const result = await Withdraw.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Withdraw not found!');
  }
  return result;
};

const updateWithdraw = async (id: string, payload: Partial<IWithdraw>) => {
  const result = await Withdraw.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Withdraw');
  }
  return result;
};

const deleteWithdraw = async (id: string) => {
  const result = await Withdraw.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete withdraw');
  }

  return result;
};

export const withdrawService = {
  createWithdraw,
  getAllWithdraw,
  getWithdrawById,
  updateWithdraw,
  deleteWithdraw,
};
