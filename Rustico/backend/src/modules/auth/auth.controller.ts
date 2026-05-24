import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from './auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = await AuthService.registrar(req.body);
      res.status(201).json({ status: 'success', data: usuario });
    } catch (err: any) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Correo y contraseña son requeridos.' });
    }
    try {
      const data = await AuthService.login({ email, password });
      res.status(200).json({ status: 'success', data });
    } catch (err: any) {
      res.status(401).json({ status: 'error', message: err.message });
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuario = await AuthService.perfil(req.user!.id);
      res.status(200).json({ status: 'success', data: usuario });
    } catch (err: any) {
      res.status(404).json({ status: 'error', message: err.message });
    }
  }

  static async listarUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarios = await AuthService.listarUsuarios();
      res.status(200).json({ status: 'success', data: usuarios });
    } catch (err) {
      next(err);
    }
  }

  static async toggleActivo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { activo } = req.body;
      const result = await AuthService.toggleActivo(id, activo);
      res.status(200).json({ status: 'success', data: result });
    } catch (err: any) {
      res.status(404).json({ status: 'error', message: err.message });
    }
  }
}
