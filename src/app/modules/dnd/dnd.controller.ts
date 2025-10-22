import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { dndService } from './dnd.service';
import sendResponse from '../../utils/sendResponse';

const createDnd = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req?.user?.userId;
  const result = await dndService.createDnd(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Dnd created successfully',
    data: result,
  });
});

const getAllDnd = catchAsync(async (req: Request, res: Response) => {
  const result = await dndService.getAllDnd(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All dnd fetched successfully',
    data: result,
  });
});
const getMyDnd = catchAsync(async (req: Request, res: Response) => {
  req.query.user = req?.user?.userId;
  const result = await dndService.getAllDnd(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All dnd fetched successfully',
    data: result,
  });
});

const getDndById = catchAsync(async (req: Request, res: Response) => {
  const result = await dndService.getDndById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dnd fetched successfully',
    data: result,
  });
});
const updateDnd = catchAsync(async (req: Request, res: Response) => {
  const result = await dndService.updateDnd(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dnd updated successfully',
    data: result,
  });
});

const deleteDnd = catchAsync(async (req: Request, res: Response) => {
  const result = await dndService.deleteDnd(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dnd deleted successfully',
    data: result,
  });
});

export const dndController = {
  createDnd,
  getAllDnd,
  getMyDnd,
  getDndById,
  updateDnd,
  deleteDnd,
};
