import express from 'express';
import dotenv from 'dotenv';
import carRoutes from './car/car.routes.js';
import userRoutes from './user/user.routes.js';
import rentalRoutes from './rental/rental.routes.js';
import { errorHandler } from './user/auth.middleware.js';
import { connectDB } from './user/user.db.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Conectar a MongoDB
connectDB();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/rentals', rentalRoutes);
// Manejo de errores global
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map