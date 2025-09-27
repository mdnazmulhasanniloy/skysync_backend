import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { dayOffService } from './dayOff.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const createDayOff = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req.user.userId;
  const result = await dayOffService.createDayOff(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'DayOff created successfully',
    data: result,
  });
});

const getAllDayOff = catchAsync(async (req: Request, res: Response) => {
  const result = await dayOffService.getAllDayOff(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All dayOff fetched successfully',
    data: result,
  });
});
const getMyDayOff = catchAsync(async (req: Request, res: Response) => {
  req.query['user'] = req.user.userId;
  const result = await dayOffService.getAllDayOff(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All dayOff fetched successfully',
    data: result,
  });
});

const getDayOffById = catchAsync(async (req: Request, res: Response) => {
  const result = await dayOffService.getDayOffById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'DayOff fetched successfully',
    data: result,
  });
});
const updateDayOff = catchAsync(async (req: Request, res: Response) => {
  const result = await dayOffService.updateDayOff(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'DayOff updated successfully',
    data: result,
  });
});

const deleteDayOff = catchAsync(async (req: Request, res: Response) => {
  const result = await dayOffService.deleteDayOff(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'DayOff deleted successfully',
    data: result,
  });
});

export const dayOffController = {
  createDayOff,
  getAllDayOff,
  getDayOffById,
  updateDayOff,
  deleteDayOff,
  getMyDayOff,
};
