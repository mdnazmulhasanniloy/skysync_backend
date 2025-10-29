import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { redemService } from './redem.service';
import sendResponse from '../../utils/sendResponse';

const createRedem = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req?.user?.userId; 
  const result = await redemService.createRedem(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Redem created successfully',
    data: result,
  });
});

const getAllRedem = catchAsync(async (req: Request, res: Response) => {
  const result = await redemService.getAllRedem(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All redem fetched successfully',
    data: result,
  });
});

const getMyRedem = catchAsync(async (req: Request, res: Response) => {
  req.query.user = req?.user?.userId;
  const result = await redemService.getAllRedem(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All redem fetched successfully',
    data: result,
  });
});

const getRedemById = catchAsync(async (req: Request, res: Response) => {
  const result = await redemService.getRedemById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Redem fetched successfully',
    data: result,
  });
});

const updateRedem = catchAsync(async (req: Request, res: Response) => {
  const result = await redemService.updateRedem(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Redem updated successfully',
    data: result,
  });
});

const completeRedem = catchAsync(async (req: Request, res: Response) => {
  const result = await redemService.acceptRedem(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Redem completed successfully',
    data: result,
  });
});

const rejectRedem = catchAsync(async (req: Request, res: Response) => {
  const result = await redemService.rejectRedem(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Redem rejected successfully',
    data: result,
  });
});

const deleteRedem = catchAsync(async (req: Request, res: Response) => {
  const result = await redemService.deleteRedem(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Redem deleted successfully',
    data: result,
  });
});

export const redemController = {
  createRedem,
  getAllRedem,
  getRedemById,
  updateRedem,
  deleteRedem,
  getMyRedem,
  completeRedem,
  rejectRedem,
};
