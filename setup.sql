CREATE DATABASE IF NOT EXISTS pokedex_db;
USE pokedex_db;

CREATE TABLE IF NOT EXISTS pokemones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen_frontal TEXT,
    imagen_posterior TEXT,
    imagen_shiny TEXT,
    altura INT,
    peso INT,
    tipos JSON
);