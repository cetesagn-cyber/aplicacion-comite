import { Router } from 'express';
import { AuthController } from './auth.controller';
import { verificarToken, requerirRol } from './auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', verificarToken as any, AuthController.me as any);

router.post('/register', verificarToken as any, requerirRol('admin') as any, AuthController.register);
router.get('/usuarios', verificarToken as any, requerirRol('admin') as any, AuthController.listarUsuarios);
router.patch('/usuarios/:id/activo', verificarToken as any, requerirRol('admin') as any, AuthController.toggleActivo);

export default router;
