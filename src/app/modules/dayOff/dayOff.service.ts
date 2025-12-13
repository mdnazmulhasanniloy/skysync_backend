import httpStatus from 'http-status';
import { IDayOff } from './dayOff.interface';
import DayOff from './dayOff.models';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import QueryBuilder from '../../core/builder/QueryBuilder';

const createDayOff = async (payload: IDayOff | IDayOff[], userId: string) => {
  const isArray = Array.isArray(payload);

  const data = isArray
    ? payload.map(item => ({
        ...item,
        user: userId,
      }))
    : {
        ...payload,
        user: userId,
      };

  const result = isArray
    ? await DayOff.insertMany(data)
    : await DayOff.create(data);

  // await DayOff.create(payload);
  if (!result || (isArray && (result as any[])?.length === 0)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create dayOff');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all dayOff list caches
    const keys = await pubClient.keys('dayOff:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createDayOff):', err);
  }

  return result;
};

const getAllDayOff = async (query: Record<string, any>) => {
  try {
    const cacheKey = 'dayOff:' + JSON.stringify(query);
    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const dayOffModel = new QueryBuilder(
      DayOff.find({ isDeleted: false }).populate({
        path: 'user',
        select:
          '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
      }),
      query,
    )
      .search(['reason', 'status'])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await dayOffModel.modelQuery;
    const meta = await dayOffModel.countTotal();
    const response = {
      data,
      meta,
    };

    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    const dayOffModel = new QueryBuilder(
      DayOff.find({ isDeleted: false }).populate({
        path: 'user',
        select:
          '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
      }),
      query,
    )
      .search(['reason', 'status'])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await dayOffModel.modelQuery;
    const meta = await dayOffModel.countTotal();
    const response = {
      data,
      meta,
    };

    return response;
  }
};

const getDayOffById = async (id: string) => {
  try {
    const cacheKey = 'dayOff:' + id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Fetch from DB
    const result = await DayOff.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result || result?.isDeleted) {
      throw new Error('DayOff not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geDayOffById):', err);
    const result = await DayOff.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result || result?.isDeleted) {
      throw new Error('DayOff not found!');
    }
    return result;
  }
};

const updateDayOff = async (id: string, payload: Partial<IDayOff>) => {
  const result = await DayOff.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update DayOff');
  }

  // 🔹 Redis cache invalidation
  try {
    // single dayOff cache delete
    await pubClient.del('dayOff:' + id);

    // dayOff list cache clear
    const keys = await pubClient.keys('dayOff:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateDayOff):', err);
  }

  return result;
};

const deleteDayOff = async (id: string) => {
  const result = await DayOff.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete dayOff');
  }

  // 🔹 Redis cache invalidation
  try {
    // single dayOff cache delete
    await pubClient.del('dayOff' + id?.toString());

    // dayOff list cache clear
    const keys = await pubClient.keys('dayOff:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteDayOff):', err);
  }

  return result;
};

export const dayOffService = {
  createDayOff,
  getAllDayOff,
  getDayOffById,
  updateDayOff,
  deleteDayOff,
};
