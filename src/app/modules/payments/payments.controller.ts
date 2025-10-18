import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentsService } from './payments.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const checkout = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req?.user?.userId;
  const result = await paymentsService.checkout(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payments created successfully',
    data: result,
  });
});

 

export const paymentsController = {
  checkout, 
};
