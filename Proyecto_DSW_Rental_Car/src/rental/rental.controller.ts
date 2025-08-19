import { Request, Response } from "express";
import { Rental } from "./rental.entity.js";
import { RentalPostgresRepository } from "./rental.postgres.repository.js";
import { CarPostgresRepository } from "../car/car.postgres.repository.js";

const rentalRepository = new RentalPostgresRepository();
const carRepository = new CarPostgresRepository();

export class RentalController {

    async findAllRentals(_req: Request, res: Response) {
        const rentals = await rentalRepository.findAll();
        res.json(rentals);
    }

    async findRentalById(req: Request, res: Response) {
        const rentalId = req.params.id;
        const rental = await rentalRepository.findOne(rentalId);
        if (!rental) {
            res.status(404).json({
                errorMessage: 'Rental not found',
                errorCode: 'RENTAL_NOT_FOUND'
            });
            return;
        }
        res.json({ data: rental });
    }

    async addRental(req: Request, res: Response) {
        const input = req.body;

        const car = await carRepository.findOne(input.carId);
        if (!car) {
            res.status(404).json({
                errorMessage: 'Car not found',
                errorCode: 'CAR_NOT_FOUND'
            });
            return;
        }

        if (!car.available) {
            res.status(400).json({
                errorMessage: 'Car not available',
                errorCode: 'CAR_NOT_AVAILABLE'
            });
            return;
        }

        const newRental = new Rental(
            input.userId,
            input.carId,
            input.startDate,
            input.endDate,
            input.price,
            input.status
        );

        await rentalRepository.add(newRental);

        res.status(201).json({ data: newRental });
    }

    async updateRental(req: Request, res: Response): Promise<void> {
 codex/update-deleterental-and-rental-state-handling
        const rentalId = req.params.id;
        const input = req.body;


        const rentalId = req.params.id;
        const input = req.body;

        const car = await carRepository.findOne(input.carId);
        if (!car) {
            res.status(404).json({
                errorMessage: 'Car not found',
                errorCode: 'CAR_NOT_FOUND'
            });
            return;
        }

        if (!car.available) {
            res.status(400).json({
                errorMessage: 'Car not available',
                errorCode: 'CAR_NOT_AVAILABLE'
            });
            return;
        }

 main
        const updatedRental = new Rental(
            input.userId,
            input.carId,
            input.startDate,
            input.endDate,
            input.price,
            input.status
        );

        await rentalRepository.update(rentalId, updatedRental);

 codex/update-deleterental-and-rental-state-handling
        if (updatedRental.status === 'completed' || updatedRental.status === 'cancelled') {
            await carRepository.partialUpdate(String(updatedRental.carId), { available: true });
        }

 main
        res.status(201).json({ data: updatedRental });
    }
    async partiallyUpdateRental(req: Request, res: Response): Promise<void> {
        const rentalId = req.params.id;
        const input = req.body;

        const updatedRental = await rentalRepository.partialUpdate(rentalId, input);

        if (!updatedRental) {
            res.status(404).json({
                errorMessage: 'Rental not found',
                errorCode: 'RENTAL_NOT_FOUND'
            });
            return;
        }
        if (updatedRental.status === 'completed' || updatedRental.status === 'cancelled') {
            const carId = (updatedRental as any).carId ?? (updatedRental as any).carid;
            await carRepository.partialUpdate(String(carId), { available: true });
        }

        res.status(200).json({ data: updatedRental });
    }
    async deleteRental(req: Request, res: Response): Promise<void> {
        const rentalId = req.params.id;

        const deleted = await rentalRepository.delete(rentalId);

        if (!deleted) {
            res.status(404).json({
                errorMessage: 'Rental not found',
                errorCode: 'RENTAL_NOT_FOUND'
            });
            return;
        }

        const carId = (deleted as any).carId ?? (deleted as any).carid;
        await carRepository.partialUpdate(String(carId), { available: true });

        res.status(204).send();
    }
}