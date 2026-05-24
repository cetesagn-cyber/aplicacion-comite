import { db } from '../../shared/database/pg.client';
import { ClientesService } from '../clientes/clientes.service';
import { CrearCitaBody, EstadoCita } from './agenda.types';
import { inicioDia, finDia } from '../../shared/utils/dates';

const CITA_SELECT = `
  a.id, a.inicio, a.fin, a.estado, a.precio_cop, a.notas,
  a.cliente_id, a.barbero_id, a.servicio_id,
  c.nombre  as cliente_nombre,  c.telefono  as cliente_telefono,
  ts.nombre as servicio_nombre, ts.duracion_min,
  u.nombre  as barbero_nombre,
  b.color_agenda as barbero_color
`;

export class AgendaService {
  static async listarPorFecha(fechaStr: string) {
    const res = await db.query(`
      SELECT ${CITA_SELECT}
      FROM agenda a
      LEFT JOIN clientes c     ON a.cliente_id  = c.id
      JOIN tipo_servicios ts   ON a.servicio_id = ts.id
      JOIN barberos b          ON a.barbero_id  = b.id
      JOIN usuarios u          ON b.usuario_id  = u.id
      WHERE a.inicio >= $1 AND a.inicio <= $2
        AND a.estado != 'cancelada'
      ORDER BY a.inicio ASC
    `, [inicioDia(fechaStr), finDia(fechaStr)]);
    return res.rows;
  }

  static async listarPorBarbero(barberoId: string, fechaStr: string) {
    const res = await db.query(`
      SELECT ${CITA_SELECT}
      FROM agenda a
      LEFT JOIN clientes c     ON a.cliente_id  = c.id
      JOIN tipo_servicios ts   ON a.servicio_id = ts.id
      JOIN barberos b          ON a.barbero_id  = b.id
      JOIN usuarios u          ON b.usuario_id  = u.id
      WHERE a.barbero_id = $1 AND a.inicio >= $2 AND a.inicio <= $3
      ORDER BY a.inicio ASC
    `, [barberoId, inicioDia(fechaStr), finDia(fechaStr)]);
    return res.rows;
  }

  static async obtener(id: string) {
    const res = await db.query(`
      SELECT ${CITA_SELECT}
      FROM agenda a
      LEFT JOIN clientes c     ON a.cliente_id  = c.id
      JOIN tipo_servicios ts   ON a.servicio_id = ts.id
      JOIN barberos b          ON a.barbero_id  = b.id
      JOIN usuarios u          ON b.usuario_id  = u.id
      WHERE a.id = $1
    `, [id]);
    if (res.rows.length === 0) throw new Error('Cita no encontrada.');
    return res.rows[0];
  }

  static async crear(body: CrearCitaBody, createdBy: string) {
    const { cliente_id, barbero_id, servicio_id, inicio, notas, precio_cop } = body;

    const servicioRes = await db.query(
      'SELECT precio_cop, duracion_min FROM tipo_servicios WHERE id = $1 AND activo = TRUE',
      [servicio_id]
    );
    if (servicioRes.rows.length === 0) throw new Error('Servicio no encontrado.');

    const { precio_cop: precioBase, duracion_min } = servicioRes.rows[0];
    const precioFinal = precio_cop ?? precioBase;
    const inicioDate = new Date(inicio);
    const finDate = new Date(inicioDate.getTime() + duracion_min * 60_000);

    const solapamiento = await db.query(`
      SELECT id FROM agenda
      WHERE barbero_id = $1
        AND estado NOT IN ('cancelada')
        AND (inicio < $3 AND fin > $2)
    `, [barbero_id, inicioDate.toISOString(), finDate.toISOString()]);

    if (solapamiento.rows.length > 0) throw new Error('El barbero ya tiene una cita en ese horario.');

    const res = await db.query(`
      INSERT INTO agenda (cliente_id, barbero_id, servicio_id, inicio, fin, estado, precio_cop, notas, created_by)
      VALUES ($1, $2, $3, $4, $5, 'confirmada', $6, $7, $8)
      RETURNING *
    `, [cliente_id || null, barbero_id, servicio_id, inicioDate.toISOString(), finDate.toISOString(), precioFinal, notas || null, createdBy]);

    return res.rows[0];
  }

  static async actualizarEstado(id: string, estado: EstadoCita) {
    const res = await db.query(
      'UPDATE agenda SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    if (res.rows.length === 0) throw new Error('Cita no encontrada.');

    if (estado === 'completada' && res.rows[0].cliente_id) {
      await ClientesService.actualizarSegmento(res.rows[0].cliente_id);
    }

    return res.rows[0];
  }

  static async resumenDia(fechaStr: string) {
    const res = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE estado != 'cancelada')          AS total_citas,
        COUNT(*) FILTER (WHERE estado = 'completada')          AS completadas,
        COUNT(*) FILTER (WHERE estado = 'pendiente' OR estado = 'confirmada') AS pendientes,
        COUNT(*) FILTER (WHERE estado = 'no_show')             AS no_shows,
        COALESCE(SUM(precio_cop) FILTER (WHERE estado = 'completada'), 0) AS ingresos_cop
      FROM agenda
      WHERE inicio >= $1 AND inicio <= $2
    `, [inicioDia(fechaStr), finDia(fechaStr)]);
    return res.rows[0];
  }
}
