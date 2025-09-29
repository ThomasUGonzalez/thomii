import { Rental } from "./rental.entity.js";
import { RentalRepository } from "./rental.repository.interface.js";
import { findUserById } from "../user/user.service.js";
import { Pool } from "pg";
import { Car } from "../car/car.entity.js";
import { IUser } from "../user/user.entity.js";

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'repository',
    password: 'postgres',
    port: 5432,
});

export class RentalPostgresRepository implements RentalRepository {
    public async updateCarAvailabilityIfReserved(rentalOrUpdates: { status?: string, car?: Car }) {
        if (rentalOrUpdates.status === "reserved" && rentalOrUpdates.car) {
            await pool.query('UPDATE cars SET available = false WHERE id = $1', [rentalOrUpdates.car.id]);
        }
    }

    constructor() {}

    async findAll(): Promise<Rental[] | undefined> {
        const res = await pool.query(`
            SELECT r.*, 
                json_build_object(
                    'id', c.id, 'brand', c.brand, 'model', c.model, 'year', c.year, 'color', c.color, 'price', c.price, 'available', c.available
                ) AS car
            FROM rentals r
            JOIN cars c ON r.carId = c.id
        `);
        const rentals = [];
        for (const row of res.rows) {
            const user = await findUserById(row.userid);
            if (user) {
                const carObj = row.car;
                const car = new Car(carObj.id, carObj.brand, carObj.model, carObj.year, carObj.color, carObj.price, carObj.available);
                const rental = new Rental(user, car, row.startdate, row.enddate, row.price, row.status, row.id);
                rentals.push(rental);
            }
        }
        return rentals.length ? rentals : undefined;
    }

    async findOne(id: number): Promise<Rental | undefined> {
        try {
            const rentalQuery = `
                SELECT 
                    r.*, 
                    json_build_object(
                        'id', c.id, 
                        'brand', c.brand, 
                        'model', c.model, 
                        'year', c.year, 
                        'color', c.color, 
                        'price', c.price, 
                        'available', c.available
                    ) AS car 
                FROM rentals r 
                JOIN cars c ON r.carId = c.id 
                WHERE r.id = $1
            `;
            const rentalResult = await pool.query(rentalQuery, [id]);
            if (rentalResult.rows.length === 0) {
                return undefined;
            }
            const row = rentalResult.rows[0];
            const user = await findUserById(row.userid);
            if (!user) {
                return undefined;
            }
            const carObj = row.car;
            const car = new Car(carObj.id, carObj.brand, carObj.model, carObj.year, carObj.color, carObj.price, carObj.available);
            return new Rental(user, car, row.startdate, row.enddate, row.price, row.status, row.id);
        } catch (error) {
            console.error('Error finding rental with user and car:', error);
            return undefined;
        }
    }

    async add(rental: Rental): Promise<Rental | undefined> {
        try {
            await this.updateCarAvailabilityIfReserved({ status: rental.status, car: rental.car });
            const res = await pool.query(
                'INSERT INTO rentals (userId, carId, startDate, endDate, price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [rental.user.id, rental.car.id, rental.startDate, rental.endDate, rental.price, rental.status]
            );
            if (res.rows.length > 0) {
                rental.id = res.rows[0].id;
            }
            return rental;
        } catch (error) {
            console.error('Error adding rental:', error);
            return undefined;
        }
    }

    async update(id: number, rental: Rental): Promise<Rental | undefined> {
        try {
            await this.updateCarAvailabilityIfReserved({ status: rental.status, car: rental.car });
            const res = await pool.query(
                'UPDATE rentals SET userId = $1, carId = $2, startDate = $3, endDate = $4, price = $5, status = $6 WHERE id = $7 RETURNING *',
                [rental.user.id, rental.car.id, rental.startDate, rental.endDate, rental.price, rental.status, id]
            );
            rental.id = res.rows[0].id;
            return rental;
        } catch (error) {
            console.error('Error updating rental:', error);
            return undefined;
        }
    }

    async partialUpdate(id: number, updates: Partial<Rental>): Promise<Rental | undefined> {
        try {
            await this.updateCarAvailabilityIfReserved(updates);
            const keys = Object.keys(updates);
            const values = Object.values(updates);
            const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
            const query = `UPDATE rentals SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
            const res = await pool.query(query, [...values, id]);
            return res.rows[0];
        } catch (error) {
            console.error('Error partially updating rental:', error);
            return undefined;
        }
    }

    async delete(id: number): Promise<Rental | undefined> {
        try {
            const res = await pool.query('DELETE FROM rentals WHERE id = $1 RETURNING *', [id]);
            return res.rows[0] as Rental || undefined;
        } catch (error) {
            console.error('Error deleting rental:', error);
            return undefined;
        }
    }
}