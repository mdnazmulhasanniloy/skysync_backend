import httpStatus from 'http-status';
import { IGiftCard } from './giftCard.interface';
import GiftCard from './giftCard.models';
import QueryBuilder from '../../core/builder/QueryBuilder';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';

const createGiftCard = async (payload: IGiftCard) => {
  const result = await GiftCard.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create giftCard');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all giftCard list caches
    const keys = await pubClient.keys('giftCard:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single giftCard cache if updating an existing unverified giftCard
    if (result?._id) {
      await pubClient.del('giftCard:' + result?._id?.toString());
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createGiftCard):', err);
  }

  return result;
};

const getAllGiftCard = async (query: Record<string, any>) => {
  try {
    const cacheKey = 'giftCard:' + JSON.stringify(query);
    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const giftCardModel = new QueryBuilder(
      GiftCard.find({ isDeleted: false }),
      query,
    )
      .search(['brand'])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await giftCardModel.modelQuery;
    const meta = await giftCardModel.countTotal();

    const response = { data, meta };

    // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    console.error('Redis caching error (getAllGiftCard):', err);
    const giftCardModel = new QueryBuilder(
      GiftCard.find({ isDeleted: false }),
      query,
    )
      .search(['brand'])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await giftCardModel.modelQuery;
    const meta = await giftCardModel.countTotal();

    return {
      data,
      meta,
    };
  }
};

const getGiftCardById = async (id: string) => {
  try {
    const cacheKey = 'giftCard:' + id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Fetch from DB
    const result = await GiftCard.findById(id);
    if (!result || result?.isDeleted) {
      throw new Error('GiftCard not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geGiftCardById):', err);
    const result = await GiftCard.findById(id);
    if (!result || result?.isDeleted) {
      throw new Error('GiftCard not found!');
    }
    return result;
  }
};

const updateGiftCard = async (id: string, payload: Partial<IGiftCard>) => {
  const result = await GiftCard.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update GiftCard');
  }

  // 🔹 Redis cache invalidation
  try {
    // single giftCard cache delete
    await pubClient.del('giftCard:' + id);

    // giftCard list cache clear
    const keys = await pubClient.keys('giftCard:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateGiftCard):', err);
  }

  return result;
};

const deleteGiftCard = async (id: string) => {
  const result = await GiftCard.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete giftCard');
  }

  // 🔹 Redis cache invalidation
  try {
    // single giftCard cache delete
    await pubClient.del('giftCard' + id?.toString());

    // giftCard list cache clear
    const keys = await pubClient.keys('giftCard:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteGiftCard):', err);
  }

  return result;
};

export const giftCardService = {
  createGiftCard,
  getAllGiftCard,
  getGiftCardById,
  updateGiftCard,
  deleteGiftCard,
};
