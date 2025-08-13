import { CarRepository } from "./car.repository.interface.js";
import { Car } from "./car.entity.js";
import { Client } from "pg";

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'repository',
    password: 'postgres',
    port: 5432,
});

export class CarPostgresRepository implements CarRepository {

    constructor() {
        client.connect();
    }

    async findAll(): Promise<Car[] | undefined> {
        const res = await client.query('SELECT * FROM cars');
        return res.rows as Car[] || undefined;
    }

    async findOne(id: string): Promise<Car | undefined> {
        const res = await client.query('SELECT * FROM cars WHERE id = $1', [id]);
        return res.rows[0] as Car || undefined;
    }

    async add(car: Car): Promise<Car | undefined> {
        try {
            const res = await client.query(
                'INSERT INTO cars (brand, model, year, color, price, available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [car.brand, car.model, car.year, car.color, car.price, car.available]
            );
            return res.rows[0];
        } catch (error) {
            console.error('Error adding car:', error);
            return undefined;
        }
    }

    async update(id: string, car: Car): Promise<Car | undefined> {
        try {
            const res = await client.query(
                'UPDATE cars SET brand = $1, model = $2, year = $3, color = $4, price = $5, available = $6 WHERE id = $7 RETURNING *',
                [car.brand, car.model, car.year, car.color, car.price, car.available, id]
            );
            return res.rows[0];
        } catch (error) {
            console.error('Error updating car:', error);
            return undefined;
        }
    }

    async partialUpdate(id: string, updates: Partial<Car>): Promise<Car | undefined> {
        try {
            const keys = Object.keys(updates);
            const values = Object.values(updates);
            const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
            const query = `UPDATE cars SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

            const res = await client.query(query, [...values, id]);
            return res.rows[0];
        } catch (error) {
            console.error('Error partially updating car:', error);
            return undefined;
        }
    }

    async delete(id: string): Promise<Car | undefined> {
        try {
            const res = await client.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);
            return res.rows[0];
        } catch (error) {
            console.error('Error deleting car:', error);
            return undefined;
        }
    }
}