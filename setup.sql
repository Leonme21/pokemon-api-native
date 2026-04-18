CREATE TABLE IF NOT EXISTS pokemones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen_frontal TEXT,
    imagen_posterior TEXT,
    imagen_shiny TEXT,
    altura INT,
    peso INT,
    tipos JSONB
);