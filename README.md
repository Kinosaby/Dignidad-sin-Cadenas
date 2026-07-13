# Dignidad Sin Cadenas - Sitio Web y Plataforma de Gestion

Plataforma web oficial de Dignidad Sin Cadenas, organizacion orientada al desarrollo humano, salud mental y reintegracion social.

## Caracteristicas Principales
- **Sitio Web Publico (index.html)**: Diseno responsivo y moderno con informacion de programas, historia, mision, vision, valores, eventos y galeria.
- **Gestion Dinamica (BaaS con Supabase)**:
  - **Configuracion del Sitio**: Todos los textos generales (Hero, Historia, Mision, Vision, Valores, Contacto) se pueden cambiar en tiempo real.
  - **Eventos**: Publicacion, edicion y eliminacion de actividades y talleres.
  - **Noticias y Blog**: Publicacion, edicion y eliminacion de comunicados.
  - **Galeria**: Carga, edicion y eliminacion de fotografias de actividades.
  - **Mensajes**: Recepcion de datos de contacto de forma segura.
- **Panel de Administracion (admin.html)**: Interfaz protegida por autenticacion de Supabase (Supabase Auth).

## Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3 Moderno (Variables CSS, Grid, Flexbox, Animaciones), JavaScript (Vanilla ES6).
- **Base de datos y Backend**: Supabase (PostgreSQL, Row Level Security, Storage Buckets, Authentication).

## Estructura de Base de Datos
El proyecto incluye un script de instalacion completo en `setup_completo_supabase.sql` que crea las siguientes tablas:
- `configuracion`: Para almacenar y editar los textos principales de la landing page.
- `eventos`: Lista de talleres y conferencias.
- `publicaciones`: Entradas de blog y noticias.
- `imagenes_publicas`: Enlaces a fotos de la galeria.
- `contactos`: Registro de mensajes del formulario.

## Configuracion del Entorno
1. Modifica las credenciales de Supabase (`SUPABASE_URL` y `SUPABASE_ANON_KEY`) al inicio de los archivos `main.js` y `admin.js`.
2. Corre el script `setup_completo_supabase.sql` en el SQL Editor de tu panel de Supabase para inicializar las tablas, politicas de seguridad RLS y el bucket de almacenamiento publico.
