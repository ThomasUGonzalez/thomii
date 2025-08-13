import { Rental } from './rental.entity';

export interface RentalRepository {
    findAll(): Promise<Rental[] | undefined>;
    findOne(id: string): Promise<Rental | undefined>;
    add(rental: Rental): Promise<Rental | undefined>;
    update(id: string, rental: Rental): Promise<Rental | undefined>;
    partialUpdate(id: string, updates: Partial<Rental>): Promise<Rental | undefined>;
    delete(id: string): Promise<Rental | undefined>;
}