import { getConnection } from './db.js';

async function seed() {
    let conn;
    try {
        conn = await getConnection();
        
        // OPCIONAL: Limpiar la tabla antes de insertar (Senior Tip)
        // RESTART IDENTITY resetea el contador del ID a 1
        await conn.query("TRUNCATE TABLE pokemones RESTART IDENTITY");

        const pokemones = [
            ['bulbasaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png', 7, 69, JSON.stringify(['grass', 'poison'])],
            ['ivysaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/2.png', 10, 130, JSON.stringify(['grass', 'poison'])],
            ['venusaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/3.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/3.png', 20, 1000, JSON.stringify(['grass', 'poison'])],
            ['charmander', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/4.png', 6, 85, JSON.stringify(['fire'])],
            ['charmeleon', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/5.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/5.png', 11, 190, JSON.stringify(['fire'])],
            ['charizard', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/6.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png', 17, 905, JSON.stringify(['fire', 'flying'])],
            ['squirtle', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/7.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/7.png', 5, 90, JSON.stringify(['water'])],
            ['wartortle', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/8.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/8.png', 10, 225, JSON.stringify(['water'])],
            ['blastoise', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/9.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/9.png', 16, 855, JSON.stringify(['water'])],
            ['caterpie', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/10.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10.png', 3, 29, JSON.stringify(['bug'])]
        ];

        // NOTA: Cambiamos "?" por "$1, $2, $3..." para PostgreSQL
        const query = `
            INSERT INTO pokemones 
            (nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipos) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        for (const pokemon of pokemones) {
            await conn.query(query, pokemon);
        }

        console.log("Seed completado con éxito en Supabase.");
    } catch (err) {
        console.error("Error en el seed:", err);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

seed();