import httpStatus from 'http-status';
import { IFlight } from './flight.interface';
import Flight from './flight.models'; 
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import { getFlights } from './flight.utils';

const createFlight = async (payload: IFlight) => {
  const result = await Flight.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create flight');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all flight list caches
    const keys = await pubClient.keys('flight:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single flight cache if updating an existing unverified flight
    if (result?._id) {
      await pubClient.del('flight:' + result?._id?.toString());
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createFlight):', err);
  }

  return result;
};

const getAllFlight = async (query: Record<string, any>) => {
  try {
    const cacheKey = 'flight:' + JSON.stringify(query);
    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const response: {
      data: any[];
      meta: { page: number; limit: number; total: number };
    } = await getFlights(query);

    // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    console.error('Redis caching error (getAllFlight):', err);
    const response: {
      data: any[];
      meta: { page: number; limit: number; total: number };
    } = await getFlights(query);

    return response;
  }
};

const getFlightById = async (id: string) => {
  try {
    const cacheKey = 'flight:' + id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Fetch from DB
    const result = await Flight.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result || result?.isDeleted) {
      throw new Error('Flight not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geFlightById):', err);
    const result = await Flight.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result || result?.isDeleted) {
      throw new Error('Flight not found!');
    }
    return result;
  }
};

const updateFlight = async (id: string, payload: Partial<IFlight>) => {
  const result = await Flight.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Flight');
  }

  // 🔹 Redis cache invalidation
  try {
    // single flight cache delete
    await pubClient.del('flight:' + id);

    // flight list cache clear
    const keys = await pubClient.keys('flight:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateFlight):', err);
  }

  return result;
};

const deleteFlight = async (id: string) => {
  const result = await Flight.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete flight');
  }

  // 🔹 Redis cache invalidation
  try {
    // single flight cache delete
    await pubClient.del('flight' + id?.toString());

    // flight list cache clear
    const keys = await pubClient.keys('flight:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteFlight):', err);
  }

  return result;
};

export const flightService = {
  createFlight,
  getAllFlight,
  getFlightById,
  updateFlight,
  deleteFlight,
};
