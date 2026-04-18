import pg from 'pg';
const { Pool } = pg;

// 1. Sin el texto "DATABASE_URL=" 
// 2. Sin los corchetes []
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@db.ljhnbbkpptfdgthyxlbn.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: {
        // Obligatorio para Supabase
        rejectUnauthorized: false 
    }
});

export const getConnection = async () => {
    // Es mejor retornar directamente la conexión
    return await pool.connect();
};