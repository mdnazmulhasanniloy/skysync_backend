import httpStatus from 'http-status';
import { IFeedback } from './feedback.interface';
import Feedback from './feedback.models';
import QueryBuilder from '../../core/builder/QueryBuilder';
import AppError from '../../error/AppError';
import { pubClient } from '../../redis';
import path from 'path';
import { sendEmail } from '../../utils/mailSender';
import fs from 'fs';
import { IUser } from '../user/user.interface';
import { FEEDBACK_STATUS } from './feedback.constants';

const createFeedback = async (payload: IFeedback) => {
  const result = await Feedback.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create feedback');
  }

  // 🔹 Redis cache invalidation
  try {
    // Clear all feedback list caches
    const keys = await pubClient.keys('feedback:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }

    // Optionally, clear single feedback cache if updating an existing unverified feedback
    if (result?._id) {
      await pubClient.del('feedback:' + result?._id?.toString());
    }
  } catch (err) {
    console.error('Redis cache invalidation error (createFeedback):', err);
  }

  return result;
};

const getAllFeedback = async (query: Record<string, any>) => {
  try {
    const cacheKey = 'feedback:' + JSON.stringify(query);
    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const feedbackModel = new QueryBuilder(
      Feedback.find({}).populate({
        path: 'user',
        select:
          '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
      }),
      query,
    )
      .search(['email', 'status'])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await feedbackModel.modelQuery;
    const meta = await feedbackModel.countTotal();

    const response = { data, meta };

    // 3. Store in cache (30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(response), { EX: 30 });

    return response;
  } catch (err) {
    console.error('Redis caching error (getAllFeedback):', err);
    const feedbackModel = new QueryBuilder(
      Feedback.find().populate({
        path: 'user',
        select:
          '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
      }),
      query,
    )
      .search(['email', 'status'])
      .filter()
      .paginate()
      .sort()
      .fields();

    const data = await feedbackModel.modelQuery;
    const meta = await feedbackModel.countTotal();

    return {
      data,
      meta,
    };
  }
};

const getFeedbackById = async (id: string) => {
  try {
    const cacheKey = 'feedback:' + id;

    // 1. Check cache
    const cachedData = await pubClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Fetch from DB
    const result = await Feedback.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Feedback not found!');
    }

    // 3. Store in cache (e.g., 30s TTL)
    await pubClient.set(cacheKey, JSON.stringify(result), { EX: 30 });

    return result;
  } catch (err) {
    console.error('Redis caching error (geFeedbackById):', err);
    const result = await Feedback.findById(id).populate({
      path: 'user',
      select:
        '-verification -password -device -expireAt -isDeleted -passwordChangedAt -needsPasswordChange -loginWth -customerId',
    });
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Feedback not found!');
    }
    return result;
  }
};

const updateFeedback = async (id: string, payload: Partial<IFeedback>) => {
  const result = await Feedback.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Feedback');
  }

  // 🔹 Redis cache invalidation
  try {
    // single feedback cache delete
    await pubClient.del('feedback:' + id);

    // feedback list cache clear
    const keys = await pubClient.keys('feedback:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateFeedback):', err);
  }

  return result;
};

const adminResponse = async (id: string, payload: Partial<IFeedback>) => {
  const result = await Feedback.findByIdAndUpdate(
    id,
    { adminResponse: payload.adminResponse, status: FEEDBACK_STATUS.resolved },
    { new: true },
  ).populate('user');
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Feedback');
  }
  if (result.howCanWeContact === 'Email') {
    // send email to user with admin response
    const mailPath = path.join(
      __dirname,
      '../../../../public/view/feedback_replay.html',
    );

    await sendEmail(
      result.email,
      'Our Response to Your Feedback',
      fs
        .readFileSync(mailPath, 'utf8')
        .replace('{{fullName}}', (result.user as IUser).name)
        .replace('{{userFeedback}}', result.message)
        .replace('{{adminResponse}}', result.adminResponse),
    );
  }
  // 🔹 Redis cache invalidation
  try {
    // single feedback cache delete
    await pubClient.del('feedback:' + id);

    // feedback list cache clear
    const keys = await pubClient.keys('feedback:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (updateFeedback):', err);
  }

  return result;
};

const deleteFeedback = async (id: string) => {
  const result = await Feedback.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete feedback');
  }

  // 🔹 Redis cache invalidation
  try {
    // single feedback cache delete
    await pubClient.del('feedback' + id?.toString());

    // feedback list cache clear
    const keys = await pubClient.keys('feedback:*');
    if (keys.length > 0) {
      await pubClient.del(keys);
    }
  } catch (err) {
    console.error('Redis cache invalidation error (deleteFeedback):', err);
  }

  return result;
};

export const feedbackService = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  adminResponse,
};
