import { Request, Response } from "express";
import { Rental } from "./rental.entity.js";
import { RentalPostgresRepository } from "./rental.postgres.repository.js";

const rentalRepository = new RentalPostgresRepository();

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
        const rentalId = req.params.id;
        const input = req.body;

        const updatedRental = new Rental(
            input.userId,
            input.carId,
            input.startDate,
            input.endDate,
            input.price,
            input.status
        );

        await rentalRepository.update(rentalId, updatedRental);

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

        res.status(204).send();
    }
}