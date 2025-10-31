import httpStatus from 'http-status';
import { IRedem } from './redem.interface';
import Redem from './redem.models';
import AppError from '../../error/AppError';
import { User } from '../user/user.models';
import moment from 'moment';
import QueryBuilder from '../../core/builder/QueryBuilder';
import { IUser } from '../user/user.interface';

const createRedem = async (payload: IRedem) => {
  const user = await User.findById(payload?.user);
  if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'User not found!');

  const createdAt = user.createdAt;
  const probationStart = moment(createdAt);
  const probationEnd = moment(createdAt).add(3, 'months'); // 3-month probation
  const withdrawEnd = moment(createdAt).add(4, 'months'); // 1-month withdrawal window after probation
  const now = moment();

  const remainingDays = probationEnd.diff(now, 'days');
  const isInProbation = now.isBetween(
    probationStart,
    probationEnd,
    'day',
    '[]',
  );
  const isInWithdraw = now.isBetween(probationEnd, withdrawEnd, 'day', '[]');

  // 🧩 Probation period check
  if (isInProbation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You're still in your probation period. ${remainingDays} day(s) left before you can use your balance.`,
    );
  }

  // 🧩 Withdrawal period check
  if (!isInWithdraw) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Your withdrawal period has ended. You can now only use points.',
    );
  }

  // 🧩 Balance validation
  if (payload?.denomination && payload.denomination > user?.balance) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient balance.');
  }

  if (payload?.points && payload.points > user?.points) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient points.');
  }

  // 🧩 Create redemption
  const result = await Redem.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create redemption.');
  }

  return result;
};

const getAllRedem = async (query: Record<string, any>) => {
  const redemModel = new QueryBuilder(
    Redem.find({ isDeleted: false }).populate([
      {
        path: 'user',
        select: '_id name email phoneNumber balance point profile',
      },
      {
        path: 'giftCard',
      },
    ]),
    query,
  )
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await redemModel.modelQuery;
  const meta = await redemModel.countTotal();

  return {
    data,
    meta,
  };
};

const getRedemById = async (id: string) => {
  const result = await Redem.findById(id).populate([
    {
      path: 'user',
      select: '_id name email phoneNumber balance point profile',
    },
    {
      path: 'giftCard',
    },
  ]);
  if (!result || result?.isDeleted) {
    throw new Error('Redem not found!');
  }
  return result;
};

const updateRedem = async (id: string, payload: Partial<IRedem>) => {
  const result = await Redem.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Redem');
  }

  return result;
};

const acceptRedem = async (id: string, payload: Partial<IRedem>) => {
  const redem = await Redem.findById(id).populate('user');
  if (!redem) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Redemption not found!');
  }

  const user = redem.user as IUser;
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

  // 🧩 Probation period check
  if (isInProbation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You're still in your probation period. ${remainingDays} day(s) left before you can redeem.`,
    );
  }

  // 🧩 Handle redemption logic
  if (isInWithdraw) {
    // Deduct from balance
    await User.findByIdAndUpdate(user._id, {
      $inc: { balance: -Number(payload?.denomination || 0) },
    });
  } else {
    // Deduct from points (probation over, withdrawal window closed)
    await User.findByIdAndUpdate(user._id, {
      $inc: { points: -Number(payload?.points || 0) },
    });
  }

  // 🧩 Update redemption record
  const result = await Redem.findByIdAndUpdate(
    id,
    { status: 'complete', giftCode: payload?.giftCode },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update redemption.');
  }

  return result;
};

const rejectRedem = async (id: string, payload: Partial<IRedem>) => {
  const result = await Redem.findByIdAndUpdate(
    id,
    {
      status: 'rejected',
      reason: payload?.reason,
    },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Redem rejected failed!');
  }

  return result;
};

const deleteRedem = async (id: string) => {
  const result = await Redem.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete redem');
  }

  return result;
};

export const redemService = {
  createRedem,
  getAllRedem,
  getRedemById,
  updateRedem,
  deleteRedem,
  acceptRedem,
  rejectRedem,
};
