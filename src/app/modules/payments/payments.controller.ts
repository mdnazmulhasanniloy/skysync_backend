import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentsService } from './payments.service';
import sendResponse from '../../utils/sendResponse'; 

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
const allTransitions = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.allTransitions(req.query);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payments history get successfully',
    data: result,
  });
});

export const paymentsController = {
  checkout,
  confirmPayments,
  allTransitions,
};
