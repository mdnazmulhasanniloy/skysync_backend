import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentsService } from './payments.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';
import { IPackage } from '../package/package.interface';
import moment from 'moment';
import { ISubscriptions } from '../subscription/subscription.interface';

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
const confirmPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.confirmPayments(req.query, res);

  // res.render('paymentSuccess', {
  //   subscriptionDetails: {
  //     paymentDetails: {
  //       transactionId: result!?.trnId,
  //       paymentDate: result?.paymentAt,
  //       cardLast4: result?.chargeDetails?.cardLast4,
  //     },
  //   },
  // });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payments created successfully',
    data: result,
  });
});

export const paymentsController = {
  checkout,
  confirmPayments,
};
