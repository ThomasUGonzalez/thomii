import { Request, Response } from "express";
import { Rental } from "./rental.entity.js";
import { RentalPostgresRepository } from "./rental.postgres.repository.js";
import { CarPostgresRepository } from "../car/car.postgres.repository.js";
import { findUserById } from "../user/user.service.js";

const rentalRepository = new RentalPostgresRepository();
const carRepository = new CarPostgresRepository();

export class RentalController {

    async findAllRentals(_req: Request, res: Response) {
        const rentals = await rentalRepository.findAll();
        const rentalsWithId = (rentals ?? []).map(rental => ({
        id: rental.id ?? rental.id,
        ...rental
        }));
        res.json(rentalsWithId);
    }

    async findRentalById(req: Request, res: Response) {
        const rentalId = Number(req.params.id);
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

        if (!car.available && input.status === "reserved") {
            res.status(400).json({
                errorMessage: 'Car not available',
                errorCode: 'CAR_NOT_AVAILABLE'
            });
            return;
        }

        const user = await findUserById(input.userId);
        if (!user) {
            res.status(404).json({
                errorMessage: 'User not found',
                errorCode: 'USER_NOT_FOUND'
            });
            return;
        }

        const newRental = new Rental(
            user,
            car,
            input.startDate,
            input.endDate,
            input.price,
            input.status
        );

        const savedRental = await rentalRepository.add(newRental);

        res.status(201).json({ data: savedRental });
    }

    async updateRental(req: Request, res: Response): Promise<void> {
        const rentalId = Number(req.params.id);
        const input = req.body;

        const car = await carRepository.findOne(input.carId);
        if (!car) {
            res.status(404).json({
                errorMessage: 'Car not found',
                errorCode: 'CAR_NOT_FOUND'
            });
            return;
        }

        if (!car.available && input.status === "reserved") {
            res.status(400).json({
                errorMessage: 'Car not available',
                errorCode: 'CAR_NOT_AVAILABLE'
            });
            return;
        }

        const user = await findUserById(input.userId);
        if (!user) {
            res.status(404).json({
                errorMessage: 'User not found',
                errorCode: 'USER_NOT_FOUND'
            });
            return;
        }

        const updatedRental = new Rental(
            user,
            car,
            input.startDate,
            input.endDate,
            input.price,
            input.status
        );

        await rentalRepository.update(rentalId, updatedRental);

        res.status(201).json({ data: updatedRental });
    }
    async partiallyUpdateRental(req: Request, res: Response): Promise<void> {
        const rentalId = Number(req.params.id);
        const input = req.body;

        let car, user;
        if (input.carId) {
            car = await carRepository.findOne(input.carId);
            if (!car) {
                res.status(404).json({
                    errorMessage: 'Car not found',
                    errorCode: 'CAR_NOT_FOUND'
                });
                return;
            }
        }
        if (input.userId) {
            user = await findUserById(input.userId);
            if (!user) {
                res.status(404).json({
                    errorMessage: 'User not found',
                    errorCode: 'USER_NOT_FOUND'
                });
                return;
            }
        }
        if (input.status === "reserved" && car && !car.available) {
            res.status(400).json({
                errorMessage: 'Car not available',
                errorCode: 'CAR_NOT_AVAILABLE'
            });
            return;
        }
        
        const patchInput = { ...input };
        if (car) patchInput.car = car;
        if (user) patchInput.user = user;

        const updatedRental = await rentalRepository.partialUpdate(rentalId, patchInput);

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
        const rentalId = Number(req.params.id);

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