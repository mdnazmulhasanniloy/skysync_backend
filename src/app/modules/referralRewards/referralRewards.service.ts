
import httpStatus from 'http-status';
import { IReferralRewards } from './referralRewards.interface';
import ReferralRewards from './referralRewards.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';

const createReferralRewards = async (payload: IReferralRewards) => {
  const result = await ReferralRewards.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create referralRewards');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all referralRewards list caches
    const keys = await pubClient.keys('referralRewards:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single referralRewards cache if updating an existing unverified referralRewards
    if (result?._id) {
      await pubClient.del('referralRewards:'+ result?._id?.toString());
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createReferralRewards):', err);
  }



  return result;
};

const getAllReferralRewards = async (query: Record<string, any>) => {
 
  try {
  const cacheKey = 'referralRewards:' + JSON.stringify(query);
      // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  const referralRewardsModel = new QueryBuilder(ReferralRewards.find({isDeleted:false}), query)
    .search([""])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await referralRewardsModel.modelQuery;
  const meta = await referralRewardsModel.countTotal();

const response = { data, meta };

  // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;

  
  } catch (err) {
    console.error('Redis caching error (getAllReferralRewards):', err);
    const referralRewardsModel = new QueryBuilder(ReferralRewards.find({isDeleted:false}), query)
    .search([""])
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
    }

const getReferralRewardsById = async (id: string) => {
try{
 const cacheKey = 'referralRewards:' +id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

// 2. Fetch from DB
   const result = await ReferralRewards.findById(id);
  if (!result && result?.isDeleted) {
    throw new Error('ReferralRewards not found!');
  }

// 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
}catch (err) {
 console.error('Redis caching error (geReferralRewardsById):', err);
  const result = await ReferralRewards.findById(id);
  if (!result && result?.isDeleted) {
    throw new Error('ReferralRewards not found!');
  }
  return result;
  
  }
};

const updateReferralRewards = async (id: string, payload: Partial<IReferralRewards>) => {
  const result = await ReferralRewards.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update ReferralRewards');
  }

   // 🔹 Redis cache invalidation
  try {
    // single referralRewards cache delete
    await pubClient.del('referralRewards:'+id);

    // referralRewards list cache clear
    const keys = await pubClient.keys('referralRewards:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateReferralRewards):', err);
  }

  return result;
};

const deleteReferralRewards = async (id: string) => {
  const result = await ReferralRewards.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete referralRewards');
  }

 // 🔹 Redis cache invalidation
  try {
    // single referralRewards cache delete
    await pubClient.del('referralRewards'+id?.toString());

    // referralRewards list cache clear
    const keys = await pubClient.keys('referralRewards:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteReferralRewards):', err);
  }




  return result;
};

export const referralRewardsService = {
  createReferralRewards,
  getAllReferralRewards,
  getReferralRewardsById,
  updateReferralRewards,
  deleteReferralRewards,
};