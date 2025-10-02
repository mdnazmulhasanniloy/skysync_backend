
import { Router } from 'express';
import { flightController } from './flight.controller';

const router = Router();

router.post('/', flightController.createFlight);
router.patch('/:id', flightController.updateFlight);
router.delete('/:id', flightController.deleteFlight);
router.get('/:id', flightController.getFlightById);
router.get('/', flightController.getAllFlight);

export const flightRoutes = router;