import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@db.ljhnbbkpptfdgthyxlbn.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false 
    }
});

export const getConnection = async () => {
    return await pool.connect();
};