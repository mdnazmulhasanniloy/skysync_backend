import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { flightService } from './flight.service';
import sendResponse from '../../utils/sendResponse';

const createFlight = catchAsync(async (req: Request, res: Response) => {
  req.body['user'] = req?.user?.userId;
 
  const result = await flightService.createFlight(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Flight created successfully',
    data: result,
  });
});

const getAllFlight = catchAsync(async (req: Request, res: Response) => {
  const result = await flightService.getAllFlight(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My flight fetched successfully',
    data: result,
  });
});
const getMyFlight = catchAsync(async (req: Request, res: Response) => {
  req.query.user = req?.user?.userId;
  const result = await flightService.getAllFlight(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All flight fetched successfully',
    data: result,
  });
});

const getFlightById = catchAsync(async (req: Request, res: Response) => {
  const result = await flightService.getFlightById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Flight fetched successfully',
    data: result,
  });
});
const updateFlight = catchAsync(async (req: Request, res: Response) => {
  const result = await flightService.updateFlight(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Flight updated successfully',
    data: result,
  });
});

const deleteFlight = catchAsync(async (req: Request, res: Response) => {
  const result = await flightService.deleteFlight(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Flight deleted successfully',
    data: result,
  });
});

export const flightController = {
  createFlight,
  getAllFlight,
  getFlightById,
  updateFlight,
  deleteFlight,
  getMyFlight,
};
