import httpStatus from 'http-status';
import { IReferralRewards } from './referralRewards.interface';
import ReferralRewards from './referralRewards.models';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import QueryBuilder from '../../core/builder/QueryBuilder';

// const createReferralRewards = async (payload: IReferralRewards) => {
//   const result = await ReferralRewards.create(payload);
//   if (!result) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Failed to create referralRewards',
//     );
//   }

//   // 🔹 Redis cache invalidation
//   try {
//     // Clear all referralRewards list caches
//     const keys = await pubClient.keys('referralRewards:*');
//     if (keys.length > 0) {
//       await pubClient.del(keys);
//     }

//     // Optionally, clear single referralRewards cache if updating an existing unverified referralRewards
//     if (result?._id) {
//       await pubClient.del('referralRewards:' + result?._id?.toString());
//     }
//   } catch (err) {
//     console.error(
//       'Redis cache invalidation error (createReferralRewards):',
//       err,
//     );
//   }

//   return result;
// };

const getAllReferralRewards = async (query: Record<string, any>) => {
  const referralRewardsModel = new QueryBuilder(ReferralRewards.find({}), query)
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await referralRewardsModel.modelQuery;
  const meta = await referralRewardsModel.countTotal();

  return {
    data,
    meta,
  };
};

const getReferralRewardsById = async (id: string) => {
  const result = await ReferralRewards.findById(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'ReferralRewards not found!');
  }
  return result;
};

// const updateReferralRewards = async (
//   id: string,
//   payload: Partial<IReferralRewards>,
// ) => {
//   const result = await ReferralRewards.findByIdAndUpdate(id, payload, {
//     new: true,
//   });

//   if (!result) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Failed to update ReferralRewards',
//     );
//   }
//   return result;
// };

const deleteReferralRewards = async (id: string) => {
  const result = await ReferralRewards.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to delete referralRewards',
    );
  }

  return result;
};

export const referralRewardsService = {
  // createReferralRewards,
  // updateReferralRewards,
  getAllReferralRewards,
  getReferralRewardsById,
  deleteReferralRewards,
};
