import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import { notificationRoutes } from '../modules/notification/notificaiton.route';
import { contentsRoutes } from '../modules/contents/contents.route';
import { packageRoutes } from '../modules/package/package.route';
import { subscriptionRoutes } from '../modules/subscription/subscription.route';
import { feedbackRoutes } from '../modules/feedback/feedback.route';
import { paymentsRoutes } from '../modules/payments/payments.route';
import { referralRewardsRoutes } from '../modules/referralRewards/referralRewards.route';
import { dayOffRoutes } from '../modules/dayOff/dayOff.route';
import { flightRoutes } from '../modules/flight/flight.route';
import { standbyRoutes } from '../modules/standby/standby.route';
import { dndRoutes } from '../modules/dnd/dnd.route';
import { giftCardRoutes } from '../modules/giftCard/giftCard.route';
import { dashboardRoutes } from '../modules/dashboard/dashboard.route';
import { homeRoutes } from '../modules/home/home.route';
import { bookmarkRoutes } from '../modules/bookmark/bookmark.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/notifications',
    route: notificationRoutes,
  },
  {
    path: '/contents',
    route: contentsRoutes,
  },
  {
    path: '/package',
    route: packageRoutes,
  },
  {
    path: '/subscriptions',
    route: subscriptionRoutes,
  },
  {
    path: '/payments',
    route: paymentsRoutes,
  },
  {
    path: '/feedback',
    route: feedbackRoutes,
  },
  {
    path: '/referral-rewords',
    route: referralRewardsRoutes,
  },
  {
    path: '/day-off',
    route: dayOffRoutes,
  },
  {
    path: '/flights',
    route: flightRoutes,
  },
  {
    path: '/standby',
    route: standbyRoutes,
  },
  {
    path: '/dnd',
    route: dndRoutes,
  },
  {
    path: '/gift-cards',
    route: giftCardRoutes,
  },
  {
    path: '/dashboard',
    route: dashboardRoutes,
  },
  {
    path: '/home-page',
    route: homeRoutes,
  },
  {
    path: '/bookmark',
    route: bookmarkRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
