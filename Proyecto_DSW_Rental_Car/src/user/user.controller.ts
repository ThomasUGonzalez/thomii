import { Request, Response } from 'express';
import { register, getUsers, findUserById, deleteUserById } from './user.service.js';

export const registerUser = async (req: Request, res: Response) => {
  const { username, name, password } = req.body;
  try {
    const user = await register(username, name, password);
    res.status(201).json(user.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.json(users.map(user => user.toJSON()));
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await findUserById(userId);
    
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    
    res.json(user.toJSON());
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
   try {
     const userId = req.user.id;
     if (userId !== req.params.id) {
       res.status(403).json({ error: 'No autorizado' });
       return; 
     }
     
     await deleteUserById(req.params.id);
     res.status(204).end();
   } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
   }
};