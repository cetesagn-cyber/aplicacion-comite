import { db } from '../../shared/database/pg.client';

export class ServiciosService {
  static async listar() {
    const res = await db.query(
      'SELECT * FROM tipo_servicios WHERE activo = TRUE ORDER BY categoria, nombre ASC'
    );
    return res.rows;
  }

  static async crear(body: { nombre: string; descripcion?: string; duracion_min: number; precio_cop: number; categoria?: string }) {
    const { nombre, descripcion, duracion_min, precio_cop, categoria = 'corte' } = body;
    const res = await db.query(
      `INSERT INTO tipo_servicios (nombre, descripcion, duracion_min, precio_cop, categoria)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, descripcion || null, duracion_min, precio_cop, categoria]
    );
    return res.rows[0];
  }

  static async actualizar(id: string, body: Partial<{ nombre: string; descripcion: string; duracion_min: number; precio_cop: number; activo: boolean }>) {
    const campos = Object.entries(body)
      .filter(([, v]) => v !== undefined)
      .map(([k, _], i) => `${k} = $${i + 2}`)
      .join(', ');
    const valores = Object.values(body).filter(v => v !== undefined);

    if (!campos) throw new Error('Sin campos para actualizar.');

    const res = await db.query(
      `UPDATE tipo_servicios SET ${campos} WHERE id = $1 RETURNING *`,
      [id, ...valores]
    );
    if (res.rows.length === 0) throw new Error('Servicio no encontrado.');
    return res.rows[0];
  }

  static async eliminar(id: string) {
    await db.query('UPDATE tipo_servicios SET activo = FALSE WHERE id = $1', [id]);
  }
}
