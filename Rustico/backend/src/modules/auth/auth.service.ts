import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../shared/database/pg.client';
import { LoginBody, RegisterBody, UsuarioPayload } from './auth.types';

const SALT_ROUNDS = 10;

export class AuthService {
  static async registrar(body: RegisterBody) {
    const { nombre, email, telefono, password, rol = 'recepcion' } = body;

    const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) throw new Error('El correo ya está registrado.');

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const res = await db.query(
      `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, rol, created_at`,
      [nombre, email, telefono || null, hash, rol]
    );

    return res.rows[0];
  }

  static async login(body: LoginBody) {
    const { email, password } = body;

    const res = await db.query(
      'SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1',
      [email]
    );

    if (res.rows.length === 0) throw new Error('Credenciales inválidas.');

    const usuario = res.rows[0];
    if (!usuario.activo) throw new Error('Usuario inactivo. Contacta al administrador.');

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) throw new Error('Credenciales inválidas.');

    const payload: UsuarioPayload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRY || '8h') as any,
    });

    return { token, usuario: payload };
  }

  static async perfil(id: string) {
    const res = await db.query(
      'SELECT id, nombre, email, telefono, rol, activo, created_at FROM usuarios WHERE id = $1',
      [id]
    );
    if (res.rows.length === 0) throw new Error('Usuario no encontrado.');
    return res.rows[0];
  }

  static async listarUsuarios() {
    const res = await db.query(
      'SELECT id, nombre, email, telefono, rol, activo, created_at FROM usuarios ORDER BY nombre ASC'
    );
    return res.rows;
  }

  static async toggleActivo(id: string, activo: boolean) {
    const res = await db.query(
      'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, activo',
      [activo, id]
    );
    if (res.rows.length === 0) throw new Error('Usuario no encontrado.');
    return res.rows[0];
  }
}
