import { Router } from 'express';
import { RentalController } from './rental.controller.js';

const rentalRouter = Router();
const rentalController = new RentalController();

rentalRouter.get('/', rentalController.findAllRentals);
rentalRouter.get('/:id', rentalController.findRentalById);
rentalRouter.post('/', sanitizeRentalInput, rentalController.addRental);
rentalRouter.put('/:id', sanitizeRentalInput, rentalController.updateRental);
rentalRouter.patch('/:id', sanitizeRentalInput, rentalController.partiallyUpdateRental);
rentalRouter.delete('/:id', rentalController.deleteRental);

function sanitizeRentalInput(req:any, res:any, next:any) {
  req.body.sanitizedInput = {
    userId: req.body.userId,
    carId: req.body.carId,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    price: req.body.price,
    status: req.body.status
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

export default rentalRouter;
