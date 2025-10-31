import httpStatus from 'http-status';
import { IDnd } from './dnd.interface';
import Dnd from './dnd.models';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import QueryBuilder from '../../core/builder/QueryBuilder';
import moment from 'moment';

const createDnd = async (payload: IDnd) => {
  payload.date = moment(payload.date).utc().toDate();
  const result = await Dnd.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create dnd');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all dnd list caches
    const keys = await pubClient.keys('dnd:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single dnd cache if updating an existing unverified dnd
    if (result?._id) {
      await pubClient.del('dnd:' + result?._id?.toString());
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createDnd):', err);
  }

  return result;
};

const getAllDnd = async (query: Record<string, any>) => {
  try {
    const cacheKey = 'dnd:' + JSON.stringify(query);
    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const dndModel = new QueryBuilder(
      Dnd.find({ isDeleted: false }).populate({
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

    const data = await dndModel.modelQuery;
    const meta = await dndModel.countTotal();

    const response = { data, meta };

    // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    console.error('Redis caching error (getAllDnd):', err);
    const dndModel = new QueryBuilder(
      Dnd.find({ isDeleted: false }).populate({
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

    const data = await dndModel.modelQuery;
    const meta = await dndModel.countTotal();

    return {
      data,
      meta,
    };
  }
};

const getDndById = async (id: string) => {
  try {
    const cacheKey = 'dnd:' + id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Fetch from DB
    const result = await Dnd.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result || result?.isDeleted) {
      throw new Error('Dnd not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geDndById):', err);
    const result = await Dnd.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result || result?.isDeleted) {
      throw new Error('Dnd not found!');
    }
    return result;
  }
};

const updateDnd = async (id: string, payload: Partial<IDnd>) => {
  const result = await Dnd.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Dnd');
  }

  // 🔹 Redis cache invalidation
  try {
    // single dnd cache delete
    await pubClient.del('dnd:' + id);

    // dnd list cache clear
    const keys = await pubClient.keys('dnd:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateDnd):', err);
  }

  return result;
};

const deleteDnd = async (id: string) => {
  const result = await Dnd.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete dnd');
  }

  // 🔹 Redis cache invalidation
  try {
    // single dnd cache delete
    await pubClient.del('dnd' + id?.toString());

    // dnd list cache clear
    const keys = await pubClient.keys('dnd:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteDnd):', err);
  }

  return result;
};

export const dndService = {
  createDnd,
  getAllDnd,
  getDndById,
  updateDnd,
  deleteDnd,
};
