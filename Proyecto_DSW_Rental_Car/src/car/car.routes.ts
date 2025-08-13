import { Router } from "express";
import { CarController } from './car.controller.js';

const carRouter = Router();
const carController = new CarController();

carRouter.get('/', carController.findAllCars);
carRouter.get('/:id', carController.findCarById);
carRouter.post('/', sanitizeCarInput, carController.addCar);
carRouter.put('/:id', sanitizeCarInput, carController.updateCar);
carRouter.patch('/:id', sanitizeCarInput, carController.partialUpdateCar);
carRouter.delete('/:id', carController.deleteCar);

function sanitizeCarInput(req:any, res:any, next:any) {

  req.body.sanitizedInput = {
    brand: req.body.brand,
    model: req.body.model,
    year: req.body.year,
    color: req.body.color,
    price: req.body.price,
    available: req.body.available
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

export default carRouter;