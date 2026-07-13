// ════════════════════════════════════════════════════════════════
//  DIGNIDAD SIN CADENAS — main.js
//  Sitio público: UI, formulario de contacto + contenido dinámico
// ════════════════════════════════════════════════════════════════

// ── Supabase: mismas credenciales que admin.js ────────────────────
// Reemplaza con los valores de tu proyecto: supabase.com → API
const SUPABASE_URL      = 'https://gqgwlfncplwcswzsqzdb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z9yDCtWlwJLAcCalc4XkpQ_dBFvSeHb';

let sb = null;
if (typeof window.supabase !== 'undefined') {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ── Menú hamburguesa ─────────────────────────────────────────────
const hamburguesa = document.getElementById('hamburguesa');
const menuMovil   = document.getElementById('menu-movil');
hamburguesa.addEventListener('click', () => menuMovil.classList.toggle('abierto'));
menuMovil.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => menuMovil.classList.remove('abierto'))
);

// ── Scroll activo en navbar ───────────────────────────────────────
const secciones = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');
function actualizarNav() {
  let actual = '';
  secciones.forEach(s => { if (window.scrollY >= s.offsetTop - 90) actual = s.id; });
  navLinks.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + actual));
}
window.addEventListener('scroll', actualizarNav, { passive: true });

// ── Animaciones de entrada ────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.animar').forEach(el => observer.observe(el));

// ── Botón scroll top ──────────────────────────────────────────────
const scrollBtn = document.getElementById('scroll-top');
window.addEventListener('scroll', () =>
  scrollBtn.classList.toggle('visible', window.scrollY > 400), { passive: true });
scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Smooth scroll ─────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    }
  });
});

// ── FAQ accordion ─────────────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) other.removeAttribute('open');
      });
    }
  });
});

// ── Selector de monto en donaciones ──────────────────────────────
const montoOpciones = document.getElementById('monto-opciones');
const montoCustom   = document.getElementById('monto-custom');
if (montoOpciones) {
  montoOpciones.querySelectorAll('.monto-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      montoOpciones.querySelectorAll('.monto-btn').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      if (montoCustom) montoCustom.value = '';
    });
  });
}
if (montoCustom) {
  montoCustom.addEventListener('input', () => {
    if (montoCustom.value && montoOpciones) {
      montoOpciones.querySelectorAll('.monto-btn').forEach(b => b.classList.remove('activo'));
    }
  });
}

// ════════════════════════════════════════════════════════════════
//  FORMULARIO DE CONTACTO
// ════════════════════════════════════════════════════════════════
const formContacto = document.getElementById('form-contacto');
const formExito    = document.getElementById('form-exito');
const formReset    = document.getElementById('form-reset');
const btnEnviar    = formContacto?.querySelector('button[type="submit"]');

if (formContacto) {
  formContacto.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validarFormulario()) return;
    await guardarContacto();
  });
}

if (formReset) {
  formReset.addEventListener('click', () => {
    formContacto.reset();
    limpiarErrores();
    formContacto.hidden = false;
    formExito.hidden    = true;
  });
}

async function guardarContacto() {
  const datos = {
    nombre:   document.getElementById('contacto-nombre').value.trim(),
    correo:   document.getElementById('contacto-correo').value.trim(),
    telefono: document.getElementById('contacto-telefono')?.value.trim() || null,
    motivo:   document.getElementById('contacto-motivo').value,
    mensaje:  document.getElementById('contacto-mensaje').value.trim(),
  };

  if (btnEnviar) {
    btnEnviar.disabled    = true;
    btnEnviar.textContent = 'Enviando...';
  }

  // Guardar en Supabase
  if (sb && SUPABASE_URL !== 'TU_SUPABASE_URL') {
    try {
      const { error } = await sb.from('contactos').insert([datos]);
      if (error) {
        console.error('Error de Supabase al guardar mensaje:', error);
        alert('⚠️ Supabase no permitió guardar el mensaje:\n\n' + error.message + '\n\n👉 Para solucionarlo: entra a Supabase → SQL Editor y corre:\nCREATE POLICY "Permitir enviar contacto" ON contactos FOR INSERT TO anon WITH CHECK (true);');
        if (btnEnviar) {
          btnEnviar.disabled    = false;
          btnEnviar.textContent = 'Enviar mensaje';
        }
        return;
      }
    } catch (err) {
      console.warn('Error de conexión con Supabase:', err);
    }
  }

  formContacto.hidden = true;
  formExito.hidden    = false;

  if (btnEnviar) {
    btnEnviar.disabled    = false;
    btnEnviar.textContent = 'Enviar mensaje';
  }
}

function validarFormulario() {
  let valido = true;
  limpiarErrores();

  const nombre     = document.getElementById('contacto-nombre');
  const correo     = document.getElementById('contacto-correo');
  const motivo     = document.getElementById('contacto-motivo');
  const telefono   = document.getElementById('contacto-telefono');
  const mensaje    = document.getElementById('contacto-mensaje');
  const privacidad = document.getElementById('contacto-privacidad');

  if (!nombre?.value.trim()) {
    mostrarError('error-nombre', 'Por favor ingresa tu nombre.', nombre); valido = false;
  }
  if (!correo?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value)) {
    mostrarError('error-correo', 'Ingresa un correo electrónico válido.', correo); valido = false;
  }
  if (telefono?.value.trim() && telefono.value.trim().length !== 10) {
    mostrarError('error-telefono', 'El teléfono debe tener exactamente 10 dígitos numéricos.', telefono); valido = false;
  }
  if (!motivo?.value) {
    mostrarError('error-motivo', 'Selecciona un motivo de contacto.', motivo); valido = false;
  }
  if (!mensaje?.value.trim() || mensaje.value.trim().length < 10) {
    mostrarError('error-mensaje', 'El mensaje debe tener al menos 10 caracteres.', mensaje); valido = false;
  }
  if (!privacidad?.checked) {
    mostrarError('error-privacidad', 'Debes aceptar el aviso de privacidad.'); valido = false;
  }
  return valido;
}

function mostrarError(idError, texto, campo = null) {
  const el = document.getElementById(idError);
  if (el) el.textContent = texto;
  if (campo) campo.classList.add('invalido');
}

function limpiarErrores() {
  document.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; });
  document.querySelectorAll('.invalido').forEach(el => el.classList.remove('invalido'));
}

['contacto-nombre', 'contacto-correo', 'contacto-telefono', 'contacto-motivo', 'contacto-mensaje'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    el.classList.remove('invalido');
    const err = document.getElementById('error-' + id.replace('contacto-', ''));
    if (err) err.textContent = '';
  });
});

const cbPriv = document.getElementById('contacto-privacidad');
if (cbPriv) {
  cbPriv.addEventListener('change', () => {
    const err = document.getElementById('error-privacidad');
    if (err) err.textContent = '';
  });
}

// ════════════════════════════════════════════════════════════════
//  CONTENIDO DINÁMICO DESDE SUPABASE
//  Se activa solo cuando las credenciales están configuradas
// ════════════════════════════════════════════════════════════════
if (sb && SUPABASE_URL !== 'TU_SUPABASE_URL') {
  cargarEventosDinamicos();
  cargarPublicaciones();
  cargarGaleria();
}

// ── Sanitizar HTML ────────────────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Re-observar elementos con animación ───────────────────────────
function reObservar(container) {
  container.querySelectorAll('.animar').forEach(el => observer.observe(el));
}

// ── SVG helpers ───────────────────────────────────────────────────
const svgFlecha = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
const svgCal    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

// ════════════════════════════════════════════════════════════════
//  EVENTOS DINÁMICOS
// ════════════════════════════════════════════════════════════════
async function cargarEventosDinamicos() {
  const grid = document.querySelector('#eventos .grid-eventos');
  if (!grid) return;

  const { data, error } = await sb
    .from('eventos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error || !data || data.length === 0) return; // Mantiene HTML estático como fallback

  const estadoLabel = { proximo: 'Próximo', pendiente: 'En planificación', realizado: 'Realizado' };

  grid.innerHTML = '';
  data.forEach((ev, i) => {
    const fechaStr = ev.fecha
      ? new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Fecha por confirmar';

    const imgHtml = ev.imagen_url
      ? `<img src="${esc(ev.imagen_url)}" alt="${esc(ev.titulo)}" style="width:100%;height:100%;object-fit:cover" loading="lazy">`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--azul),#2D6A9F);display:flex;align-items:center;justify-content:center">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5">
             <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
           </svg>
         </div>`;

    grid.insertAdjacentHTML('beforeend', `
      <article class="tarjeta-evento animar animar-retraso-${(i % 3) + 1}">
        <div class="evento-imagen">${imgHtml}</div>
        <div class="evento-cuerpo">
          <div class="evento-meta">
            <span class="evento-fecha">${svgCal} ${esc(fechaStr)}${ev.hora ? ' · ' + esc(ev.hora) : ''}</span>
            <span class="chip">${esc(ev.tipo || 'Evento')}</span>
          </div>
          <h3>${esc(ev.titulo)}</h3>
          <p>${esc(ev.descripcion || '')}</p>
          <div class="evento-footer">
            <span class="evento-estado ${esc(ev.estado || 'proximo')}">${esc(estadoLabel[ev.estado] || ev.estado)}</span>
            <a href="#contacto" class="btn-prog">Informes ${svgFlecha}</a>
          </div>
        </div>
      </article>
    `);
  });
  reObservar(grid);
}

// ════════════════════════════════════════════════════════════════
//  BLOG / PUBLICACIONES (sección Historias se convierte en blog)
// ════════════════════════════════════════════════════════════════
async function cargarPublicaciones() {
  const grid = document.querySelector('#historias .grid-historias');
  if (!grid) return;

  const { data, error } = await sb
    .from('publicaciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error || !data || data.length === 0) return; // Mantiene HTML estático

  // Actualizar encabezado de la sección
  const etiqueta = document.querySelector('#historias .etiqueta');
  const titulo   = document.querySelector('#historias .titulo-seccion');
  const subtitulo = document.querySelector('#historias .subtitulo-seccion');
  if (etiqueta) etiqueta.textContent = 'Noticias y actualizaciones';
  if (titulo)   titulo.textContent   = 'Publicaciones recientes';
  if (subtitulo) subtitulo.textContent = 'Las últimas noticias y novedades de nuestra organización.';

  // Ocultar aviso de "historia representativa" si existe
  const aviso = document.querySelector('#historias .historias-aviso');
  if (aviso) aviso.style.display = 'none';

  grid.innerHTML = '';
  data.forEach((pub, i) => {
    const fecha = new Date(pub.created_at).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const resumen = pub.contenido
      ? pub.contenido.substring(0, 180) + (pub.contenido.length > 180 ? '...' : '')
      : '';

    const imgHtml = pub.imagen_url
      ? `<img src="${esc(pub.imagen_url)}" alt="${esc(pub.titulo)}" style="width:100%;height:100%;object-fit:cover" loading="lazy">`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--dorado-oscuro),#8B6914);display:flex;align-items:center;justify-content:center">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.5">
             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
           </svg>
         </div>`;

    grid.insertAdjacentHTML('beforeend', `
      <article class="tarjeta-historia animar animar-retraso-${(i % 3) + 1}">
        <div class="historia-imagen">${imgHtml}</div>
        <div class="historia-cuerpo">
          <span class="chip">${esc(pub.categoria || 'Noticias')}</span>
          <h3>${esc(pub.titulo)}</h3>
          <p>${esc(resumen)}</p>
          <div class="historia-footer">
            <span class="historia-autor">— ${esc(fecha)}</span>
          </div>
        </div>
      </article>
    `);
  });
  reObservar(grid);
}

// ════════════════════════════════════════════════════════════════
//  GALERÍA FOTOGRÁFICA
// ════════════════════════════════════════════════════════════════
async function cargarGaleria() {
  const grid  = document.getElementById('grid-galeria');
  const aviso = document.getElementById('galeria-vacia');
  const seccion = document.getElementById('galeria');
  if (!grid) return;

  const { data, error } = await sb
    .from('imagenes_publicas')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(12);

  if (error || !data || data.length === 0) {
    if (aviso) aviso.style.display = 'block';
    // Si no hay fotos, ocultamos la sección
    if (seccion) seccion.style.display = 'none';
    return;
  }

  if (aviso)   aviso.style.display   = 'none';
  if (seccion) seccion.style.display = '';

  grid.innerHTML = '';
  data.forEach((img, i) => {
    grid.insertAdjacentHTML('beforeend', `
      <div class="galeria-item animar animar-retraso-${(i % 4) + 1}">
        <img src="${esc(img.url)}" alt="${esc(img.titulo || 'Foto')}" loading="lazy">
        ${img.titulo ? `<div class="galeria-item-titulo">${esc(img.titulo)}</div>` : ''}
      </div>
    `);
  });
  reObservar(grid);
}
