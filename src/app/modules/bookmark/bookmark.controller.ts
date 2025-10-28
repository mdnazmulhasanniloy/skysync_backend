import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { bookmarkService } from './bookmark.service';
import sendResponse from '../../utils/sendResponse';

const createBookmark = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req?.user?.userId;
  const result = await bookmarkService.createBookmark(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: result?.message
      ? result?.message
      : 'Bookmark created successfully',
    data: result,
  });
});

const getMyBookmark = catchAsync(async (req: Request, res: Response) => {
  req.query['user'] = req?.user?.userId;
  const result = await bookmarkService.getAllBookmark(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My bookmark fetched successfully',
    data: result,
  });
});

const getBookmarkById = catchAsync(async (req: Request, res: Response) => {
  const result = await bookmarkService.getBookmarkById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookmark fetched successfully',
    data: result,
  });
});
const updateBookmark = catchAsync(async (req: Request, res: Response) => {
  const result = await bookmarkService.updateBookmark(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookmark updated successfully',
    data: result,
  });
});

const deleteBookmark = catchAsync(async (req: Request, res: Response) => {
  const result = await bookmarkService.deleteBookmark(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Bookmark deleted successfully',
    data: result,
  });
});

export const bookmarkController = {
  createBookmark,
  getMyBookmark,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
};
