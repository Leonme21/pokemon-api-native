import http from 'node:http';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { getConnection } from './db.js';

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

    // --- RUTA: Documentación Swagger ---
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
        let client;
        try {
            client = await getConnection();
            const id = searchParams.get('id');
            const nombre = searchParams.get('nombre');

            let query = "SELECT * FROM pokemones";
            let params = [];

            // PostgreSQL usa $1, $2 en lugar de ?
            if (id) {
                query += " WHERE id = $1";
                params.push(id);
            } else if (nombre) {
                query += " WHERE nombre = $1";
                params.push(nombre.toLowerCase());
            } else {
                query += " ORDER BY id ASC LIMIT 10";
            }

            // El driver 'pg' devuelve el resultado en la propiedad .rows
            const response = await client.query(query, params);
            const rows = response.rows;
            
            // Mapeo para asegurar que 'tipos' sea un objeto JSON
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
            if (client) client.release(); // Importante liberar el cliente al pool
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Ruta no encontrada" }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor Senior activo en puerto ${PORT}`);
});