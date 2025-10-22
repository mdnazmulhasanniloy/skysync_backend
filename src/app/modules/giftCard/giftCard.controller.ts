import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { giftCardService } from './giftCard.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const createGiftCard = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    req.body.logo = await uploadToS3({
      file: req.file,
      fileName: `images/gift-card/logo/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }
  const result = await giftCardService.createGiftCard(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'GiftCard created successfully',
    data: result,
  });
});

const getAllGiftCard = catchAsync(async (req: Request, res: Response) => {
  const result = await giftCardService.getAllGiftCard(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All giftCard fetched successfully',
    data: result,
  });
});

const getGiftCardById = catchAsync(async (req: Request, res: Response) => {
  const result = await giftCardService.getGiftCardById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'GiftCard fetched successfully',
    data: result,
  });
});
const updateGiftCard = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    req.body.logo = await uploadToS3({
      file: req.file,
      fileName: `images/gift-card/logo/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }
  const result = await giftCardService.updateGiftCard(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'GiftCard updated successfully',
    data: result,
  });
});

const deleteGiftCard = catchAsync(async (req: Request, res: Response) => {
  const result = await giftCardService.deleteGiftCard(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'GiftCard deleted successfully',
    data: result,
  });
});

export const giftCardController = {
  createGiftCard,
  getAllGiftCard,
  getGiftCardById,
  updateGiftCard,
  deleteGiftCard,
};
