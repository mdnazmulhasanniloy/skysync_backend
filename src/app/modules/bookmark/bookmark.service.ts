import httpStatus from 'http-status';
import { IBookmark } from './bookmark.interface';
import Bookmark from './bookmark.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../core/builder/QueryBuilder';

const createBookmark = async (payload: IBookmark) => {
  const isExist = await Bookmark.findOne({
    user: payload.user,
    reference: payload.reference,
  });
  if (isExist) {
    const result = await Bookmark.findByIdAndDelete(isExist?._id);
    if (!result)
      throw new AppError(httpStatus.BAD_REQUEST, 'Bookmark delete failed!');
    return { ...result?.toObject(), message: 'Bookmark delete successfully!' };
  }

  const result = await Bookmark.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create bookmark');
  }

  return result;
};

const getAllBookmark = async (query: Record<string, any>) => {
  const bookmarkModel = new QueryBuilder(
    Bookmark.find({}).populate([
      {
        path: 'reference',
        populate: [
          { path: 'user', select: '_id name email phoneNumber profile bio' },
        ],
      },
      { path: 'user', select: '_id name email phoneNumber profile bio' },
    ]),
    query,
  )
    .search([''])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await bookmarkModel.modelQuery;
  const meta = await bookmarkModel.countTotal();

  return {
    data,
    meta,
  };
};

const getBookmarkById = async (id: string) => {
  const result = await Bookmark.findById(id).populate([
    {
      path: 'reference',
      populate: [
        { path: 'user', select: '_id name email phoneNumber profile bio' },
      ],
    },
    { path: 'user', select: '_id name email phoneNumber profile bio' },
  ]);
  if (!result) {
    throw new Error('Bookmark not found!');
  }
  return result;
};

const updateBookmark = async (id: string, payload: Partial<IBookmark>) => {
  const result = await Bookmark.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Bookmark');
  }

  return result;
};

const deleteBookmark = async (id: string) => {
  const result = await Bookmark.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete bookmark');
  }

  return result;
};

export const bookmarkService = {
  createBookmark,
  getAllBookmark,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
};
