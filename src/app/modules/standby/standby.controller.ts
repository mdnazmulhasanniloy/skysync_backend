import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { standbyService } from './standby.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const createStandby = catchAsync(async (req: Request, res: Response) => { 
  const result = await standbyService.createStandby(req.body, req.user.userId);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Standby created successfully',
    data: result,
  });
});

const getAllStandby = catchAsync(async (req: Request, res: Response) => {
  const result = await standbyService.getAllStandby(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All standby fetched successfully',
    data: result,
  });
});
const getMyStandby = catchAsync(async (req: Request, res: Response) => {
  req.query.user = req?.user?.userId;
  const result = await standbyService.getAllStandby(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All standby fetched successfully',
    data: result,
  });
});

const getStandbyById = catchAsync(async (req: Request, res: Response) => {
  const result = await standbyService.getStandbyById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Standby fetched successfully',
    data: result,
  });
});
const updateStandby = catchAsync(async (req: Request, res: Response) => {
  const result = await standbyService.updateStandby(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Standby updated successfully',
    data: result,
  });
});

const deleteStandby = catchAsync(async (req: Request, res: Response) => {
  const result = await standbyService.deleteStandby(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Standby deleted successfully',
    data: result,
  });
});

export const standbyController = {
  createStandby,
  getAllStandby,
  getStandbyById,
  updateStandby,
  deleteStandby,
  getMyStandby,
};
