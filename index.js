import http from 'node:http';
import { URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { getConnection } from './db.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    // --- CORRECCIÓN SENIOR: Headers Globales de CORS Robustos ---
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept'); // Añadidos headers necesarios
    res.setHeader('Content-Type', 'application/json');

    // --- CORRECCIÓN SENIOR: Manejo de Preflight (OPTIONS) ---
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

            // --- CORRECCIÓN SENIOR: Búsqueda Insensible a Mayúsculas y Espacios ---
            if (id) {
                query += " WHERE id = $1";
                params.push(id);
            } else if (nombre) {
                // Usamos TRIM para borrar espacios y ILIKE para ignorar Mayúsculas/Minúsculas
                query += " WHERE TRIM(nombre) ILIKE $1"; 
                params.push(nombre.toLowerCase().trim());
            } else {
                query += " ORDER BY id ASC LIMIT 10";
            }

            const response = await client.query(query, params);
            const rows = response.rows;
            
            const result = rows.map(p => ({
                ...p,
                tipos: typeof p.tipos === 'string' ? JSON.parse(p.tipos) : p.tipos
            }));

            // Si se buscó algo específico y no hay resultados, devolvemos 404
            if ((id || nombre) && result.length === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: "Pokémon no encontrado" }));
            } else {
                res.writeHead(200);
                // Si es búsqueda específica devolvemos el objeto, si no, el array
                res.end(JSON.stringify((id || nombre) ? result[0] : result));
            }
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "DB Error", message: err.message }));
        } finally {
            if (client) client.release();
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Ruta no encontrada" }));
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor Senior activo en puerto ${PORT}`);
    
    // Seed automático para Render Free Tier
    console.log("🛠️  Iniciando Seed automático...");
    exec('node seed.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error en Seed: ${error.message}`);
            return;
        }
        console.log(`✅ Resultado del Seed: ${stdout}`);
    });
});
