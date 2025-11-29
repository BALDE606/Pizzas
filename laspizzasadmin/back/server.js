// Importaciones necesarias
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'chavalongo',
    password: process.env.DB_PASSWORD || 'chavalongo21',
    database: process.env.DB_NAME || 'pizzapissa'
};

// Crear pool de conexiones (mysql2/promise ya devuelve promesas)
const pool = mysql.createPool(dbConfig);

// Rutas
// GET - Obtener todos los pedidos
app.get('/pedidos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pedidos ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

// GET - Obtener pedidos pendientes (estatus = 0)
app.get('/pedidos/pending', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE estatus = 0 ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener pedidos pendientes:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos pendientes' });
    }
});

// GET - Obtener un pedido específico
//app.get('/pedidos/:id', async (req, res) => {
    //try {
        //const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
        //if (rows.length === 0) {
            //return res.status(404).json({ error: 'Pedido no encontrado' });
        //}
        //res.json(rows[0]);
    //} catch (error) {
      //  console.error('Error al obtener el pedido:', error);
    //    res.status(500).json({ error: 'Error al obtener el pedido' });
  //  }
//});



// PUT - Actualizar estado del pedido
app.put('/pedidos/:id', async (req, res) => {
    const { estado } = req.body; // puede ser número (0,1,2,3) o string ('pendiente', 'entregado', ...)

    if (estado === undefined || estado === null) {
        return res.status(400).json({ error: 'El estado es requerido' });
    }

    // Mapeo de estados: se almacena numérico en la columna `estatus`
    const estadoNames = {
        0: 'pendiente',
        1: 'entregado',
        //2: 'preparando',
        3: 'cancelado'
    };

    let estadoNum = null;
    if (typeof estado === 'number') {
        if (Object.prototype.hasOwnProperty.call(estadoNames, estado)) estadoNum = estado;
    } else if (typeof estado === 'string') {
        const parsed = Number(estado);
        if (!isNaN(parsed) && Object.prototype.hasOwnProperty.call(estadoNames, parsed)) {
            estadoNum = parsed;
        } else {
            // buscar por nombre (case-insensitive)
            const lower = estado.toLowerCase();
            for (const [k, v] of Object.entries(estadoNames)) {
                if (v.toLowerCase() === lower) {
                    estadoNum = Number(k);
                    break;
                }
            }
        }
    }

    if (estadoNum === null) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE pedidos SET estatus = ? WHERE id = ?',
            [estadoNum, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({ mensaje: 'Pedido actualizado exitosamente', estatus: estadoNum });
    } catch (error) {
        console.error('Error al actualizar el pedido:', error);
        res.status(500).json({ error: 'Error al actualizar el pedido' });
    }
});

// GET - Corte de caja por fecha o rango
// Ejemplos:
//  /corte?fecha=2025-11-13
//  /corte?desde=2025-11-01&hasta=2025-11-13
app.get('/corte', async (req, res) => {
    const { fecha, desde, hasta } = req.query;
    try {
        let rows = [];
        let summary = { total: 0, total_pedidos: 0 };

        if (fecha) {
            // Obtener pedidos de una fecha específica
            const [r] = await pool.query('SELECT * FROM pedidos WHERE DATE(fecha) = ? ORDER BY fecha DESC', [fecha]);
            rows = r;
        } else if (desde && hasta) {
            // Obtener pedidos en un rango (incluye todo el día)
            const desdeTs = `${desde} 00:00:00`;
            const hastaTs = `${hasta} 23:59:59`;
            const [r] = await pool.query('SELECT * FROM pedidos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC', [desdeTs, hastaTs]);
            rows = r;
        } else {
            return res.status(400).json({ error: 'Parámetros inválidos. Use `fecha=YYYY-MM-DD` o `desde=YYYY-MM-DD&hasta=YYYY-MM-DD`' });
        }

        // Calcular totales
        if (Array.isArray(rows)) {
            const total = rows.reduce((acc, p) => acc + (Number(p.importe) || 0), 0);
            summary = { total, total_pedidos: rows.length };
        }

        res.json({ summary, pedidos: rows });
    } catch (error) {
        console.error('Error al obtener corte de caja:', error);
        res.status(500).json({ error: 'Error al obtener el corte de caja' });
    }
});



// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});