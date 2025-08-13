import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interfaz para extender Request
declare module 'express' {
  interface Request {
    user?: any;
  }
}

// Logger de peticiones
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`Method: ${req.method}`);
  console.log(`Path:   ${req.path}`);
  if (req.method !== 'GET') {
    console.log(`Body:   ${JSON.stringify(req.body)}`);
  }
  console.log('---');
  next();
};

// Handler de errores
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);

  if (err.name === 'CastError') {
    res.status(400).json({ error: 'Formato de ID inválido' });
  } else if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
  } else if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
    res.status(400).json({ error: 'El nombre de usuario debe ser único' });
  } else if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Token inválido' });
  } else if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expirado' });
  } else {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Extrae el usuario del token
export const userExtractor = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ error: 'Token faltante o inválido' });
    return; 
  }

  const token = authHeader.substring(7);
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET || 'mysecretkey') as { id: string };
    if (!decodedToken.id) {
      res.status(401).json({ error: 'Token inválido' });
      return; 
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
};