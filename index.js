import http from 'node:http';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises'; // Para leer el swagger.json
import { getConnection } from './db.js';

// PORT dinámico para Render, fallback a 3000 para local
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    // Headers Globales (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- NUEVA RUTA: Documentación Swagger ---
    if (pathname === '/api/docs' && req.method === 'GET') {
        try {
            const swaggerData = await readFile('./swagger.json', 'utf-8');
            res.writeHead(200);
            res.end(swaggerData);
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "No se pudo cargar la documentación" }));
        }
        return;
    }

    // --- RUTA: Pokemones ---
    if (pathname === '/api/pokemones' && req.method === 'GET') {
        let conn;
        try {
            conn = await getConnection();
            const id = searchParams.get('id');
            const nombre = searchParams.get('nombre');

            let query = "SELECT * FROM pokemones";
            let params = [];

            if (id) {
                query += " WHERE id = ?";
                params.push(id);
            } else if (nombre) {
                query += " WHERE nombre = ?";
                params.push(nombre.toLowerCase());
            } else {
                query += " LIMIT 10";
            }

            const rows = await conn.query(query, params);
            
            const result = rows.map(p => ({
                ...p,
                tipos: typeof p.tipos === 'string' ? JSON.parse(p.tipos) : p.tipos
            }));

            if ((id || nombre) && result.length === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: "Pokémon no encontrado" }));
            } else {
                res.writeHead(200);
                res.end(JSON.stringify((id || nombre) ? result[0] : result));
            }
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "DB Error", message: err.message }));
        } finally {
            if (conn) conn.release();
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Ruta no encontrada" }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor Senior activo en puerto ${PORT}`);
});