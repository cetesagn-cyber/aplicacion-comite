import { db } from '../../shared/database/pg.client';

export class ClientesService {
  static async listar(page = 1, limite = 20, busqueda = '') {
    const offset = (page - 1) * limite;
    const filtro = busqueda ? `%${busqueda}%` : '%';

    const [dataRes, totalRes] = await Promise.all([
      db.query(`
        SELECT id, nombre, telefono, email, segmento, total_visitas, ticket_promedio, ultimo_servicio, created_at
        FROM clientes
        WHERE nombre ILIKE $1 OR telefono ILIKE $1 OR email ILIKE $1
        ORDER BY nombre ASC
        LIMIT $2 OFFSET $3
      `, [filtro, limite, offset]),
      db.query(`
        SELECT COUNT(*) FROM clientes
        WHERE nombre ILIKE $1 OR telefono ILIKE $1 OR email ILIKE $1
      `, [filtro]),
    ]);

    return {
      clientes: dataRes.rows,
      total: parseInt(totalRes.rows[0].count),
      pagina: page,
      totalPaginas: Math.ceil(parseInt(totalRes.rows[0].count) / limite),
    };
  }

  static async obtener(id: string) {
    const res = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (res.rows.length === 0) throw new Error('Cliente no encontrado.');
    return res.rows[0];
  }

  static async crear(body: { nombre: string; telefono?: string; email?: string; notas_privadas?: string }) {
    const { nombre, telefono, email, notas_privadas } = body;
    const res = await db.query(
      `INSERT INTO clientes (nombre, telefono, email, notas_privadas)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, telefono || null, email || null, notas_privadas || null]
    );
    return res.rows[0];
  }

  static async actualizar(id: string, body: Partial<{ nombre: string; telefono: string; email: string; notas_privadas: string; segmento: string }>) {
    const campos = Object.entries(body)
      .filter(([, v]) => v !== undefined)
      .map(([k, _], i) => `${k} = $${i + 2}`)
      .join(', ');
    const valores = Object.values(body).filter(v => v !== undefined);

    if (!campos) throw new Error('Sin campos para actualizar.');

    const res = await db.query(
      `UPDATE clientes SET ${campos} WHERE id = $1 RETURNING *`,
      [id, ...valores]
    );
    if (res.rows.length === 0) throw new Error('Cliente no encontrado.');
    return res.rows[0];
  }

  static async historial(id: string) {
    const res = await db.query(`
      SELECT a.id, a.inicio, a.fin, a.estado, a.precio_cop, a.notas,
             ts.nombre as servicio, ts.duracion_min,
             u.nombre as barbero
      FROM agenda a
      JOIN tipo_servicios ts ON a.servicio_id = ts.id
      JOIN barberos b ON a.barbero_id = b.id
      JOIN usuarios u ON b.usuario_id = u.id
      WHERE a.cliente_id = $1
      ORDER BY a.inicio DESC
      LIMIT 50
    `, [id]);
    return res.rows;
  }

  static async actualizarSegmento(id: string) {
    const res = await db.query(`
      SELECT COUNT(*) as visitas,
             MAX(inicio::date) as ultimo
      FROM agenda
      WHERE cliente_id = $1 AND estado = 'completada'
    `, [id]);

    const { visitas, ultimo } = res.rows[0];
    const n = parseInt(visitas);
    const diasSinVisita = ultimo
      ? Math.floor((Date.now() - new Date(ultimo).getTime()) / 86_400_000)
      : 999;

    let segmento = 'nuevo';
    if (n === 0) segmento = 'nuevo';
    else if (n >= 10 && diasSinVisita <= 60) segmento = 'vip';
    else if (n >= 3 && diasSinVisita <= 45) segmento = 'frecuente';
    else if (diasSinVisita > 90) segmento = 'inactivo';
    else if (diasSinVisita > 45) segmento = 'en_riesgo';

    await db.query(
      'UPDATE clientes SET total_visitas = $1, ultimo_servicio = $2, segmento = $3 WHERE id = $4',
      [n, ultimo, segmento, id]
    );
  }
}
