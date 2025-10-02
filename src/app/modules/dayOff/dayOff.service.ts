import httpStatus from 'http-status';
import { IDayOff } from './dayOff.interface';
import DayOff from './dayOff.models';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';

const createDayOff = async (payload: IDayOff) => {
  const result = await DayOff.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create dayOff');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all dayOff list caches
    const keys = await pubClient.keys('dayOff:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single dayOff cache if updating an existing unverified dayOff
    if (result?._id) {
      await pubClient.del('dayOff:' + result?._id?.toString());
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
    const response: {
      data: any[];
      meta: { page: number; limit: number; total: number };
    } = await getAllDayOff(query);
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    const response: {
      data: any[];
      meta: { page: number; limit: number; total: number };
    } = await getAllDayOff(query);

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
    const result = await DayOff.findById(id).populate([
      { path: 'user', select: 'id _id email name phoneNumber profile' },
    ]);
    if (!result || result?.isDeleted) {
      throw new Error('DayOff not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geDayOffById):', err);
    const result = await DayOff.findById(id).populate([
      { path: 'user', select: 'id _id email name phoneNumber profile' },
    ]);
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
