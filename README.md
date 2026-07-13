# Dignidad Sin Cadenas — Sitio Web & Plataforma de Gestión

Plataforma web oficial de **Dignidad Sin Cadenas**, organización orientada al desarrollo humano, salud mental y reintegración social.

## 🚀 Características Principales
- **Sitio Web Público (`index.html`)**: Diseño responsivo y moderno con información de programas, historias de transformación, eventos y galería fotográfica.
- **Gestión Dinámica (BaaS con Supabase)**:
  - **Eventos**: Publicación y actualización de actividades y talleres en tiempo real.
  - **Noticias & Blog**: Publicación de comunicados e historias de impacto.
  - **Galería Fotográfica**: Carga y visualización de imágenes comunitarias.
  - **Formulario de Contacto**: Recepción de mensajes en base de datos.
- **Panel de Administración (`admin.html`)**: Interfaz segura de 4 pestañas protegida por autenticación de Supabase (`signInWithPassword`).

## 🛠️ Tecnologías
- **Frontend**: HTML5, CSS3 Moderno (Variables CSS, Grid/Flexbox, Animaciones), JavaScript (Vanilla ES6+).
- **Backend / Base de datos**: [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, Storage Buckets & Authentication).
