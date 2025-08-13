import { Rental } from "./rental.entity.js";
import { RentalRepository } from "./rental.repository.interface.js";
import { findUserById } from "../user/user.service.js";
import { Client } from "pg";

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'repository',
    password: 'postgres',
    port: 5432,
});

export class RentalPostgresRepository implements RentalRepository {

    constructor() {
        client.connect();
    }

    async findAll(): Promise<Rental[] | undefined> {
        const res = await client.query('SELECT * FROM rentals');
        return res.rows as Rental[] || undefined;
    }

   async findOne(id: string): Promise<any | undefined> {
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
            
            const rentalResult = await client.query(rentalQuery, [id]);
            
            if (rentalResult.rows.length === 0) {
                return undefined;
            }

            const rental = rentalResult.rows[0];
            
            const user = await findUserById(rental.userid);
            
            return {
                ...rental,
                user: user ? user.toJSON() : null 
            };
            
        } catch (error) {
            console.error('Error finding rental with user and car:', error);
            return undefined;
        }
    }

    async add(rental: Rental): Promise<Rental | undefined> {
        try {
            const res = await client.query(
                'INSERT INTO rentals (userId, carId, startDate, endDate, price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [rental.userId, rental.carId, rental.startDate, rental.endDate, rental.price, rental.status]
            );
            return res.rows[0];
        } catch (error) {
            console.error('Error adding rental:', error);
            return undefined;
        }
    }

    async update(id: string, rental: Rental): Promise<Rental | undefined> {
        try {
            const res = await client.query(
                'UPDATE rentals SET userId = $1, carId = $2, startDate = $3, endDate = $4, price = $5, status = $6 WHERE id = $7 RETURNING *',
                [rental.userId, rental.carId, rental.startDate, rental.endDate, rental.price, rental.status, id]
            );
            return res.rows[0];
        } catch (error) {
            console.error('Error updating rental:', error);
            return undefined;
        }
    }

    async partialUpdate(id: string, updates: Partial<Rental>): Promise<Rental | undefined> {
        try {
            const keys = Object.keys(updates);
            const values = Object.values(updates);
            const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
            const query = `UPDATE rentals SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
            const res = await client.query(query, [...values, id]);
            return res.rows[0];
        } catch (error) {
            console.error('Error partially updating rental:', error);
            return undefined;
        }
    }

    async delete(id: string): Promise<Rental | undefined> {
        try {
            const res = await client.query('DELETE FROM rentals WHERE id = $1 RETURNING *', [id]);
            return res.rows[0] as Rental || undefined;
        } catch (error) {
            console.error('Error deleting rental:', error);
            return undefined;
        }
    }
}