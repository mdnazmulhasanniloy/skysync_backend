import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { withdrawService } from './withdraw.service';
import sendResponse from '../../utils/sendResponse';

const createWithdraw = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req?.user?.userId;
  const result = await withdrawService.createWithdraw(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Withdraw created successfully',
    data: result,
  });
});

const getAllWithdraw = catchAsync(async (req: Request, res: Response) => {
  const result = await withdrawService.getAllWithdraw(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All withdraw fetched successfully',
    data: result,
  });
});

const getMyWithdraw = catchAsync(async (req: Request, res: Response) => {
  req.query['user'] = req?.user?.userId;
  const result = await withdrawService.getAllWithdraw(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All withdraw fetched successfully',
    data: result,
  });
});

const getWithdrawById = catchAsync(async (req: Request, res: Response) => {
  const result = await withdrawService.getWithdrawById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Withdraw fetched successfully',
    data: result,
  });
});

const rejectRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await withdrawService.updateWithdraw(req.params.id, {
    status: 'rejected',
    reason: req.body.reason,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Withdraw updated successfully',
    data: result,
  });
});
const acceptRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await withdrawService.updateWithdraw(req.params.id, {
    status: 'accepted',
    tranId: req.body.tranId,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Withdraw updated successfully',
    data: result,
  });
});

const deleteWithdraw = catchAsync(async (req: Request, res: Response) => {
  const result = await withdrawService.deleteWithdraw(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Withdraw deleted successfully',
    data: result,
  });
});

export const withdrawController = {
  createWithdraw,
  getAllWithdraw,
  getWithdrawById,
  rejectRequest,
  deleteWithdraw,
  getMyWithdraw,
  acceptRequest,
};
