import http from 'node:http';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { exec } from 'node:child_process'; // Para ejecutar el seed automáticamente
import { getConnection } from './db.js';

// PORT dinámico para Render
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    // Headers Globales (CORS para que cualquier Front pueda consumirlo)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    // Manejo de Preflight (OPTIONS)
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

            // Lógica Senior: Parámetros numerados para PostgreSQL ($1, $2...)
            if (id) {
                query += " WHERE id = $1";
                params.push(id);
            } else if (nombre) {
                query += " WHERE nombre = $1";
                params.push(nombre.toLowerCase());
            } else {
                query += " ORDER BY id ASC LIMIT 10";
            }

            // Ejecución con el driver 'pg'
            const response = await client.query(query, params);
            const rows = response.rows;
            
            // Mapeo: Si 'tipos' viene como string (JSON), lo parseamos a objeto
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
            if (client) client.release(); // Liberar conexión al pool
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Ruta no encontrada" }));
    }
});

// Arrancar el servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor Senior activo en puerto ${PORT}`);
    
    // --- WORKAROUND PARA PLANES GRATUITOS ---
    // Ejecutamos el seed automáticamente al iniciar el servidor
    console.log("🛠️  Iniciando Seed automático en la nube...");
    exec('node seed.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error en Seed: ${error.message}`);
            return;
        }
        if (stderr) {
            console.warn(`⚠️ Log de Seed: ${stderr}`);
        }
        console.log(`✅ Resultado del Seed: ${stdout}`);
    });
});
