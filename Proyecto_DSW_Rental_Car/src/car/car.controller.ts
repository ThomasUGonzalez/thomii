import { Request, Response } from 'express';
import { Car } from './car.entity.js';
import { CarPostgresRepository } from './car.postgres.repository.js';

const carRepository = new CarPostgresRepository();

export class CarController {

    async findAllCars(req: Request, res: Response) {
        const cars = await carRepository.findAll();
        res.json(cars);
    }

    async findCarById(req: Request, res: Response) {
        const carId = req.params.id;
        const car = await carRepository.findOne(carId);
        if (!car) {
            res.status(404).json({
                errorMessage: 'Car not found',
                errorCode: 'CAR_NOT_FOUND'
            });
            return;
        }
        res.json({ data: car });
    }

    async addCar(req: Request, res: Response) {

        const input = req.body;
        const newCar = new Car(
            undefined,
            input.brand,
            input.model,
            input.year,
            input.color,
            input.price,
            input.available
        );

        await carRepository.add(newCar);

        res.status(201).json({ data: newCar });

    }

    async updateCar(req: Request, res: Response): Promise<void> {
        const carId = req.params.id;
        const input = req.body;

        const updatedCar = new Car(
            carId,
            input.brand,
            input.model,
            input.year,
            input.color,
            input.price,
            input.available
        );

        await carRepository.update(carId, updatedCar);

        res.status(201).json({ data: updatedCar });

    }

    async partialUpdateCar(req: Request, res: Response): Promise<void> {
      try {
        const id = req.params.id;
        const updates = req.body.sanitizedInput;

        if (!updates || Object.keys(updates).length === 0) {
          res.status(400).json({ error: 'No update data provided' });
          return;
        }

        const updated = await carRepository.partialUpdate(id, updates);

        if (!updated) {
          res.status(404).json({ error: 'Car not found or update failed' });
          return;
        }

        res.status(200).json(updated);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
    }

    async deleteCar(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;

            const deleted = await carRepository.delete(id);

            if (!deleted) {
                res.status(404).json({ error: 'Car not found' });
                return;
            }

            res.status(200).json({ message: 'Car deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}
