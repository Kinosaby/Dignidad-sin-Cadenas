-- ==============================================================================
-- SCRIPT DE CONFIGURACIÓN Y BLINDAJE TOTAL DE SUPABASE (v5.0)
-- DIGNIDAD SIN CADENAS
-- Copia todo este archivo y ejecútalo en el SQL EDITOR de tu Supabase.
-- ==============================================================================

-- 1. TABLA EVENTOS
CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha DATE,
    hora TEXT,
    imagen_url TEXT,
    tipo TEXT DEFAULT 'Evento',
    estado TEXT DEFAULT 'proximo',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA PUBLICACIONES (BLOG / NOTICIAS)
CREATE TABLE IF NOT EXISTS public.publicaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    imagen_url TEXT,
    categoria TEXT DEFAULT 'Noticias',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA IMAGENES_PUBLICAS (GALERÍA FOTOGRÁFICA)
CREATE TABLE IF NOT EXISTS public.imagenes_publicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT,
    url TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA CONTACTOS (MENSAJES DE LA WEB)
CREATE TABLE IF NOT EXISTS public.contactos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT,
    motivo TEXT,
    mensaje TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ACTIVAR SEGURIDAD RLS EN TODAS LAS TABLAS
-- ==============================================================================
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imagenes_publicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- ELIMINAR POLÍTICAS ANTIGUAS SI EXISTIERAN PARA EVITAR DUPLICADOS
-- ==============================================================================
DROP POLICY IF EXISTS "Lectura publica de eventos" ON public.eventos;
DROP POLICY IF EXISTS "Edicion admin eventos" ON public.eventos;

DROP POLICY IF EXISTS "Lectura publica de publicaciones" ON public.publicaciones;
DROP POLICY IF EXISTS "Edicion admin publicaciones" ON public.publicaciones;

DROP POLICY IF EXISTS "Lectura publica de imagenes" ON public.imagenes_publicas;
DROP POLICY IF EXISTS "Edicion admin imagenes" ON public.imagenes_publicas;

DROP POLICY IF EXISTS "Permitir enviar contacto" ON public.contactos;
DROP POLICY IF EXISTS "Permitir enviar contacto al publico" ON public.contactos;
DROP POLICY IF EXISTS "Lectura admin contactos" ON public.contactos;

-- ==============================================================================
-- CREAR POLÍTICAS CORRECTAS PARA CADA TABLA
-- ==============================================================================

-- EVENTOS: Público lee, Admin autenticado edita
CREATE POLICY "Lectura publica de eventos" 
ON public.eventos FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Edicion admin eventos" 
ON public.eventos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PUBLICACIONES: Público lee, Admin autenticado edita
CREATE POLICY "Lectura publica de publicaciones" 
ON public.publicaciones FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Edicion admin publicaciones" 
ON public.publicaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- GALERÍA (IMAGENES_PUBLICAS): Público lee, Admin autenticado edita
CREATE POLICY "Lectura publica de imagenes" 
ON public.imagenes_publicas FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Edicion admin imagenes" 
ON public.imagenes_publicas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CONTACTOS: Visitantes envían (INSERT), Admin lee y elimina
CREATE POLICY "Permitir enviar contacto" 
ON public.contactos FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Lectura admin contactos" 
ON public.contactos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Eliminar admin contactos" 
ON public.contactos FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- BUCKET DE ALMACENAMIENTO (STORAGE) PARA IMÁGENES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dignidad-storage', 'dignidad-storage', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Lectura publica de storage" ON storage.objects;
DROP POLICY IF EXISTS "Edicion admin de storage" ON storage.objects;

CREATE POLICY "Lectura publica de storage"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'dignidad-storage');

CREATE POLICY "Edicion admin de storage"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'dignidad-storage')
WITH CHECK (bucket_id = 'dignidad-storage');
