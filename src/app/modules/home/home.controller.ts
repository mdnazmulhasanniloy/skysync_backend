import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { homeService } from './home.service';
import sendResponse from '../../utils/sendResponse';

const getMySchedule = catchAsync(async (req: Request, res: Response) => {
  if (!req.query.userId) {
    req.query.userId = req.user?.userId as string;
  }

  const schedule = await homeService.getMySchedule(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Schedule retrieved successfully',
    data: schedule,
  });
});
const standByFilter = catchAsync(async (req: Request, res: Response) => {
  const schedule = await homeService.standByFilter(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'standby filter successfully',
    data: schedule,
  });
});
const dayOfFilter = catchAsync(async (req: Request, res: Response) => {
  const schedule = await homeService.dayOfFilter(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'day off  filter successfully',
    data: schedule,
  });
});
const flightFilter = catchAsync(async (req: Request, res: Response) => {
  const schedule = await homeService.flightFilter(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'flight  filter successfully',
    data: schedule,
  });
});
const dndFilter = catchAsync(async (req: Request, res: Response) => {
  const schedule = await homeService.dndFilter(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'dnd  filter successfully',
    data: schedule,
  });
});

export const homeController = {
  getMySchedule,
  standByFilter,
  dayOfFilter,
  flightFilter,
  dndFilter,
};
