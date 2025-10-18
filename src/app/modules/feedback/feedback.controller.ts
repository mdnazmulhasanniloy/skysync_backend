
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';  
import { feedbackService } from './feedback.service';
import sendResponse from '../../utils/sendResponse'; 
import { FEEDBACK_STATUS } from './feedback.constants';

const createFeedback = catchAsync(async (req: Request, res: Response) => {
  req.body["user"]=req?.user?.userId
 const result = await feedbackService.createFeedback(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Feedback created successfully',
    data: result,
  });

});

const getAllFeedback = catchAsync(async (req: Request, res: Response) => {

 const result = await feedbackService.getAllFeedback(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All feedback fetched successfully',
    data: result,
  });

});

const getFeedbackById = catchAsync(async (req: Request, res: Response) => {
 const result = await feedbackService.getFeedbackById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Feedback fetched successfully',
    data: result,
  });

});
const updateFeedback = catchAsync(async (req: Request, res: Response) => {
const result = await feedbackService.updateFeedback(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Feedback updated successfully',
    data: result,
  });

});
const makeResolved = catchAsync(async (req: Request, res: Response) => {
  const result = await feedbackService.updateFeedback(req.params.id, {
    status: FEEDBACK_STATUS.resolved,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Feedback updated successfully',
    data: result,
  });
});


const deleteFeedback = catchAsync(async (req: Request, res: Response) => {
 const result = await feedbackService.deleteFeedback(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Feedback deleted successfully',
    data: result,
  });

});

export const feedbackController = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  makeResolved,
};