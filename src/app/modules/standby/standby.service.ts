import httpStatus from 'http-status';
import { IStandby } from './standby.interface';
import Standby from './standby.models';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import QueryBuilder from '../../core/builder/QueryBuilder';

const createStandby = async (payload: IStandby | IStandby[]) => {
  const isArray = Array.isArray(payload);
  const result = isArray
    ? await Standby.insertMany(payload)
    : await Standby.create(payload);

  if (!result || (isArray && (result as any[])?.length === 0)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create standby');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all standby list caches
    const keys = await pubClient.keys('standby:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createStandby):', err);
  }

  return result;
};

const getAllStandby = async (query: Record<string, any>) => {
  try {
    const cacheKey = 'standby:' + JSON.stringify(query);
    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const standbyModel = new QueryBuilder(
      Standby.find({ isDeleted: false }).populate({
        path: 'user',
        select:
          '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
      }),
      query,
    )
      .search([''])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await standbyModel.modelQuery;
    const meta = await standbyModel.countTotal();

    const response = { data, meta };

    // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    console.error('Redis caching error (getAllStandby):', err);
    const standbyModel = new QueryBuilder(
      Standby.find({ isDeleted: false }).populate({
        path: 'user',
        select:
          '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
      }),
      query,
    )
      .search([''])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await standbyModel.modelQuery;
    const meta = await standbyModel.countTotal();

    return {
      data,
      meta,
    };
  }
};

const getStandbyById = async (id: string) => {
  try {
    const cacheKey = 'standby:' + id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Fetch from DB
    const result = await Standby.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result || result?.isDeleted) {
      throw new Error('Standby not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geStandbyById):', err);
    const result = await Standby.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result || result?.isDeleted) {
      throw new Error('Standby not found!');
    }
    return result;
  }
};

const updateStandby = async (id: string, payload: Partial<IStandby>) => {
  const result = await Standby.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Standby');
  }

  // 🔹 Redis cache invalidation
  try {
    // single standby cache delete
    await pubClient.del('standby:' + id);

    // standby list cache clear
    const keys = await pubClient.keys('standby:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateStandby):', err);
  }

  return result;
};

const deleteStandby = async (id: string) => {
  const result = await Standby.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete standby');
  }

  // 🔹 Redis cache invalidation
  try {
    // single standby cache delete
    await pubClient.del('standby' + id?.toString());

    // standby list cache clear
    const keys = await pubClient.keys('standby:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteStandby):', err);
  }

  return result;
};

export const standbyService = {
  createStandby,
  getAllStandby,
  getStandbyById,
  updateStandby,
  deleteStandby,
};
