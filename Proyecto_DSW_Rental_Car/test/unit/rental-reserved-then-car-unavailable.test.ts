import { jest } from '@jest/globals';

const mockQuery = jest.fn();

await jest.unstable_mockModule('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({ query: mockQuery }))
}));
    
import { RentalPostgresRepository } from '../../src/rental/rental.postgres.repository';

describe('ActualizarDisponibilidadDelVehiculoSiEstaReservado', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  test('actualiza la disponibilidad del vehiculo cuando el estado es reservado y se proporciona el vehiculo', async () => {
    const repo = new RentalPostgresRepository();
    const car = {
  id: '1',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  color: 'Blue',
  price: 100000,
  available: true
};
    await repo.updateCarAvailabilityIfReserved({ status: 'reserved', car });
    expect(mockQuery).toHaveBeenCalledWith('UPDATE cars SET available = false WHERE id = $1', [car.id]);
  });

  test('no hace nada cuando el estado no esta reservado', async () => {
    const repo = new RentalPostgresRepository();
    const car = {
  id: '1',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  color: 'Blue',
  price: 100000,
  available: true
};
    await repo.updateCarAvailabilityIfReserved({ status: 'pending', car });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('No hace nada cuando el estado no esta provisto', async () => {
    const repo = new RentalPostgresRepository();
    await repo.updateCarAvailabilityIfReserved({ status: 'reserved' });
    expect(mockQuery).not.toHaveBeenCalled();
  });
});