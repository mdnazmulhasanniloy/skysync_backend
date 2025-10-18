import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { referralRewardsService } from './referralRewards.service';
import sendResponse from '../../utils/sendResponse';

// const createReferralRewards = catchAsync(async (req: Request, res: Response) => {
//  const result = await referralRewardsService.createReferralRewards(req.body);
//   sendResponse(res, {
//     statusCode: 201,
//     success: true,
//     message: 'ReferralRewards created successfully',
//     data: result,
//   });

// });

const getAllReferralRewards = catchAsync(
  async (req: Request, res: Response) => {
    const result = await referralRewardsService.getAllReferralRewards(
      req.query,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All referralRewards fetched successfully',
      data: result,
    });
  },
);
const getMyReferralRewards = catchAsync(async (req: Request, res: Response) => {
  req.query['referrer'] = req?.user?.userId;
  const result = await referralRewardsService.getAllReferralRewards(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All referralRewards fetched successfully',
    data: result,
  });
});

const getReferralRewardsById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await referralRewardsService.getReferralRewardsById(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'ReferralRewards fetched successfully',
      data: result,
    });
  },
);

// const updateReferralRewards = catchAsync(async (req: Request, res: Response) => {
// const result = await referralRewardsService.updateReferralRewards(req.params.id, req.body);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'ReferralRewards updated successfully',
//     data: result,
//   });

// });

const deleteReferralRewards = catchAsync(
  async (req: Request, res: Response) => {
    const result = await referralRewardsService.deleteReferralRewards(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'ReferralRewards deleted successfully',
      data: result,
    });
  },
);

export const referralRewardsController = {
  // createReferralRewards,
  // updateReferralRewards,
  getMyReferralRewards,
  getAllReferralRewards,
  getReferralRewardsById,
  deleteReferralRewards,
};
