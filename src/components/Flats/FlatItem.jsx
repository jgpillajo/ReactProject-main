// Importación de React
import React from 'react';
// Importación del componente Link de react-router-dom para la navegación
import { Link } from 'react-router-dom';

// Definición del componente FlatItem como una función de React
// Recibe un objeto 'flat' como prop, que contiene los datos del piso
export default function FlatItem({ flat }) {
    return (
        // Contenedor principal del componente
        <div style={{ width: '300px', marginRight: '16px' }}>
            {/* Link que envuelve todo el contenido del piso para hacerlo clickeable */}
            {/* Navega a la página de detalles del piso cuando se hace clic */}
            <Link to={`/flat/${flat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {/* Imagen del piso */}
                <img 
                    src={flat.imageUrl} 
                    alt={`Flat en ${flat.city}`} 
                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
                />
                {/* Título con la dirección del piso */}
                <h2 style={{ fontSize: '1.2rem', margin: '8px 0' }}>
                    {flat.streetName}, {flat.streetNumber}, {flat.city}
                </h2>
            </Link>
        </div>
    );
}