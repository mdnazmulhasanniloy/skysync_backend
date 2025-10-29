import httpStatus from 'http-status';
import { IPayments } from './payments.interface';
import Subscription from '../subscription/subscription.models';
import AppError from '../../error/AppError';
import Payments from './payments.models';
import { IUser } from '../user/user.interface';
import { ISubscriptions } from '../subscription/subscription.interface';
import StripeService from '../../core/stripe/stripe';
import { User } from '../user/user.models';
import config from '../../config';
import { IPackage } from './../package/package.interface';
import { Response } from 'express';
import moment from 'moment';
import ReferralRewards from '../referralRewards/referralRewards.models';
import { REFERRAL_REWARDS } from '../referralRewards/referralRewards.constants';
import { startSession } from 'mongoose';
import pickQuery from '../../utils/pickQuery';
import { paginationHelper } from '../../helpers/pagination.helpers';

const checkout = async (payload: IPayments) => {
  let paymentData;
  let customerId: string;

  const isPaymentExists = await Payments.findOne({
    subscription: payload?.subscription,
    user: payload?.user,
    isPaid: false,
    isDeleted: false,
  });

  const subscription: ISubscriptions | null = await Subscription.findById(
    payload?.subscription,
  ).populate([
    { path: 'package' },
    { path: 'user', select: '_id name email phoneNumber customerId ' },
  ]);
  if (!subscription) {
    throw new AppError(httpStatus.BAD_REQUEST, 'subscription not found!');
  }

  if (isPaymentExists) {
    paymentData = isPaymentExists;
  } else {
    const createdPayment = await Payments.create({
      subscription: subscription?._id,
      user: (subscription?.user as IUser)?._id,
      amount: subscription?.amount,
    });

    if (!createdPayment) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create payment',
      );
    }

    paymentData = createdPayment;
  }

  if (!paymentData)
    throw new AppError(httpStatus.BAD_REQUEST, 'payment not found');

  if ((subscription?.user as IUser)?.customerId) {
    customerId = (subscription?.user as IUser)?.customerId;
  } else {
    const customer = await StripeService.createCustomer(
      (subscription?.user as IUser)?.email as string,
      (subscription?.user as IUser)?.name || 'Jon Do',
    );
    await User.findByIdAndUpdate(
      (subscription?.user as IUser)?._id,
      {
        customerId: customer?.id,
      },
      { new: true },
    );

    customerId = customer?.id;
  }

  const success_url = `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${paymentData?._id}`;

  const cancel_url = `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${paymentData?._id}`;
  const product = {
    amount: paymentData?.amount,

    name: (subscription?.package as IPackage)?.title ?? 'Subscription Payments',
    quantity: 1,
  };

  const checkoutSession = await StripeService.getCheckoutSession(
    product,
    success_url,
    cancel_url,
    customerId,
  );
  return checkoutSession?.url;
};

const confirmPayments = async (query: Record<string, any>, res: Response) => {
  const session = await startSession();
  session.startTransaction();

  const { sessionId, paymentId } = query;
  const PaymentSession = await StripeService.getPaymentSession(sessionId);
  const paymentIntentId = PaymentSession.payment_intent as string;

  const paymentIntent =
    await StripeService.getStripe().paymentIntents.retrieve(paymentIntentId);

  const isPaymentSuccess = await StripeService.isPaymentSuccess(sessionId);
  if (!isPaymentSuccess) {
    await session.abortTransaction();
    session.endSession();
    return res.render('paymentError', {
      message: 'Payment session is not completed',
    });
  }

  try {
    const payment = await Payments.findById(paymentId).session(session);
    if (!payment) {
      throw new AppError(httpStatus?.BAD_REQUEST, 'Payment not found!');
    }

    if (payment.isPaid) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This payment is already confirmed',
      );
    }

    const charge = await StripeService.getStripe().charges.retrieve(
      paymentIntent.latest_charge as string,
    );

    if (charge?.refunded) {
      await session.abortTransaction();
      session.endSession();
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment has been refunded');
    }

    const paymentDate = moment.unix(charge.created).format('YYYY-MM-DD HH:mm');

    const chargeDetails = {
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      paymentMethod: charge.payment_method,
      paymentMethodDetails: charge.payment_method_details?.card,
      transactionId: charge.balance_transaction,
      cardLast4: charge.payment_method_details?.card?.last4,
      paymentDate,
      receipt_url: charge.receipt_url,
    };
    console.log('🚀 ~ confirmPayments ~ chargeDetails:', chargeDetails);

    const oldSubscription = await Subscription.findOne({
      user: payment?.user,
      isPaid: true,
      isExpired: false,
      isDeleted: false,
    }).session(session);

    let expiredAt = moment();

    if (
      oldSubscription?.expiredAt &&
      moment(oldSubscription.expiredAt).isAfter(moment())
    ) {
      expiredAt = moment(oldSubscription.expiredAt);
    }

    if (oldSubscription) {
      await Subscription.findByIdAndUpdate(
        oldSubscription._id,
        { isExpired: true },
        { session },
      );
    }

    const subscription = await Subscription.findById(payment.subscription)
      .populate([
        { path: 'package' },
        {
          path: 'user',
          select: '_id email name phoneNumber isCompleteFirstSubscribe',
        },
      ])
      .session(session);

    if ((subscription?.package as IPackage)?.days) {
      expiredAt = expiredAt.add(
        (subscription?.package as IPackage)?.days,
        'days',
      );
    }
    const paymentData = {
      isPaid: true,
      trnId: chargeDetails.transactionId ?? null,
      cardLast4: chargeDetails.cardLast4 ?? null,
      receipt_url: chargeDetails?.receipt_url || charge.receipt_url,
      paymentIntentId,
      paymentAt: moment.unix(charge.created).toDate(),
    };
    const updatedPayments = await Payments.findByIdAndUpdate(
      paymentId,
      paymentData,
      {
        new: true,
        session,
      },
    );

    await Subscription.findByIdAndUpdate(
      subscription?._id,
      {
        isPaid: true,
        trnId: chargeDetails.transactionId ?? null,
        expiredAt: expiredAt.toDate(),
      },
      { session },
    );

    const isHaveReferralRewords = await ReferralRewards.findOne({
      referredUser: subscription?.user,
      status: REFERRAL_REWARDS.pending,
    })
      .populate('referrer')
      .session(session);
    if (isHaveReferralRewords) {
      const createdAt = (isHaveReferralRewords?.referrer as IUser)?.createdAt;
      const probationStart = moment(createdAt);
      const probationEnd = moment(createdAt).add(3, 'months');
      const now = moment();

      // Check if current date is within probation period
      const isInProbation = now.isBetween(
        probationStart,
        probationEnd,
        'day',
        '[]',
      );

      if (
        isInProbation &&
        (isHaveReferralRewords?.referrer as IUser)?.referralCount < 10
      ) {
        await ReferralRewards.findByIdAndUpdate(
          isHaveReferralRewords._id,
          {
            status: REFERRAL_REWARDS.completed,
            subscription: subscription?._id,
          },
          { session },
        );

        await User.findByIdAndUpdate(
          (isHaveReferralRewords?.referrer as IUser)?._id,
          { $inc: { balance: 5, referralCount: 1 } },
          { session },
        );
      } else if (!isInProbation) {
        await ReferralRewards.findByIdAndUpdate(
          isHaveReferralRewords._id,
          {
            status: REFERRAL_REWARDS.completed,
            subscription: subscription?._id,
          },
          { session },
        );

        await User.findByIdAndUpdate(
          (isHaveReferralRewords?.referrer as IUser)?._id,
          { $inc: { points: 5 } },
          { session },
        );
      }
    }

    await session.commitTransaction();
    return {
      ...updatedPayments?.toObject(),
      chargeDetails,
      package: subscription?.package,
    };
  } catch (error: any) {
    await session.abortTransaction();
    if (paymentIntentId) {
      try {
        await StripeService.refund(paymentIntentId);
      } catch (refundError: any) {
        console.error('Error processing refund:', refundError.message);
        throw res.render('paymentError', {
          message:
            'Error processing refund:' + refundError.message ||
            'Server internal error',
        });
      }
    }
    throw res.render('paymentError', {
      message: error.message || 'Server internal error',
    });
  } finally {
    session.endSession();
  }
};

const allTransitions = async (query: Record<string, any>) => {
  const { filters, pagination } = await pickQuery(query);
  const { searchTerm } = filters;

  const pipeline: any[] = [{ $match: { isDeleted: false, isPaid: true } }];

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [{ trnId: { $regex: searchTerm, $options: 'i' } }],
      },
    });
  }

  const { page, limit, skip, sort } =
    paginationHelper.calculatePagination(pagination);

  if (sort) {
    const sortArray = sort.split(',').map(field => {
      const trimmed = field.trim();
      return trimmed.startsWith('-')
        ? { [trimmed.slice(1)]: -1 }
        : { [trimmed]: 1 };
    });
    pipeline.push({ $sort: Object.assign({}, ...sortArray) });
  }

  pipeline.push({
    $facet: {
      totalData: [{ $count: 'total' }],
      paginatedData: [
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  phoneNumber: 1,
                  profile: 1,
                },
              },
            ],
          },
        },
        { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
      ],
    },
  });

  const cartData = await Payments.aggregate([
    {
      $facet: {
        todayIncome: [
          {
            $match: {
              isDeleted: false,
              isPaid: true,
              createdAt: {
                $gte: moment().utc().startOf('day').toDate(),
                $lte: moment().utc().endOf('day').toDate(),
              },
            },
          },
          {
            $group: { _id: null, totalAmount: { $sum: '$amount' } },
          },
          { $project: { _id: 0, totalAmount: 1 } },
        ],
        totalIncome: [
          {
            $match: { isDeleted: false, isPaid: true },
          },
          {
            $group: { _id: null, totalAmount: { $sum: '$amount' } },
          },
          { $project: { _id: 0, totalAmount: 1 } },
        ],
      },
    },
  ]);

  const [transitionData] = await Payments.aggregate(pipeline);

  const todayEarning = cartData[0]?.todayIncome?.[0]?.totalAmount || 0;
  const totalEarnings = cartData[0]?.totalIncome?.[0]?.totalAmount || 0;

  const total = transitionData?.totalData?.totalData || 0;
  const data = transitionData?.paginatedData || [];

  return {
    todayEarning,
    totalEarnings,
    allTransitions: {
      meta: {
        page,
        limit,
        total,
      },
      data,
    },
  };
};

export const paymentsService = {
  checkout,
  confirmPayments,
  allTransitions,
};
