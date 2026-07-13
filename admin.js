// ════════════════════════════════════════════════════════════════
//  DIGNIDAD SIN CADENAS — admin.js
//  Panel de administración completo con Supabase
// ════════════════════════════════════════════════════════════════

const SUPABASE_URL      = 'https://gqgwlfncplwcswzsqzdb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z9yDCtWlwJLAcCalc4XkpQ_dBFvSeHb';

const BUCKET = 'imagenes-eventos';

// ── Refs DOM ─────────────────────────────────────────────────────
const loginSection  = document.getElementById('login-section');
const uploadSection = document.getElementById('upload-section');
const emailInput    = document.getElementById('admin-email');
const passInput     = document.getElementById('admin-pass');
const btnLogin      = document.getElementById('btn-login');
const loginError    = document.getElementById('login-error');
const btnLogout     = document.getElementById('btn-logout');
const userDisplay   = document.getElementById('user-email-display');

let sbAdmin = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  sbAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function mostrarErrorLogin(mensaje) {
  if (loginError) {
    loginError.textContent = mensaje;
    loginError.style.display = 'block';
    loginError.style.whiteSpace = 'pre-line';
    loginError.style.textAlign = 'left';
  }
  alert(mensaje);
}

// ── Autenticación ────────────────────────────────────────────────
async function verificarSesion() {
  if (!sbAdmin) return;
  try {
    const { data: { session } } = await sbAdmin.auth.getSession();
    actualizarUI(session);
  } catch (e) {
    console.error('Error verificando sesión:', e);
  }
}

function actualizarUI(session) {
  if (session) {
    if (loginSection)  loginSection.style.display  = 'none';
    if (uploadSection) uploadSection.style.display = 'block';
    if (session.user?.email && userDisplay) userDisplay.textContent = session.user.email;
    cargarEventos();
    cargarBlog();
    cargarGaleria();
    cargarMensajes();
    cargarConfiguracionAdmin();
  } else {
    if (loginSection)  loginSection.style.display  = 'flex';
    if (uploadSection) uploadSection.style.display = 'none';
  }
}

if (sbAdmin) {
  sbAdmin.auth.onAuthStateChange((_event, session) => {
    actualizarUI(session);
  });
  verificarSesion();
} else {
  mostrarErrorLogin('❌ Error: No se pudo cargar la librería de Supabase desde internet. Verifica tu conexión.');
}

async function iniciarSesion() {
  const email = emailInput?.value.trim().toLowerCase();
  const pass  = passInput?.value;
  if (!email || !pass) { 
    mostrarErrorLogin('⚠️ Por favor escribe tu correo electrónico y tu contraseña.');
    return; 
  }

  if (!sbAdmin) {
    mostrarErrorLogin('❌ No se ha podido conectar a la librería de Supabase.');
    return;
  }
  
  if (btnLogin) {
    btnLogin.textContent = 'Verificando credenciales...';
    btnLogin.disabled    = true;
  }
  if (loginError) {
    loginError.textContent = '';
    loginError.style.display = 'none';
  }
  
  try {
    const { data, error } = await sbAdmin.auth.signInWithPassword({ email, password: pass });
    
    if (error) {
      console.error('Error al iniciar sesión:', error);
      let mensaje = '❌ Correo o contraseña incorrectos.';
      if (error.message.toLowerCase().includes('not confirmed')) {
        mensaje = '⚠️ Tu correo no está confirmado en Supabase.';
      }
      mostrarErrorLogin(mensaje);
    } else if (data && data.session) {
      actualizarUI(data.session);
    }
  } catch (err) {
    console.error('Excepción en iniciarSesion:', err);
    mostrarErrorLogin(`❌ Error de conexión al servidor Supabase:\n${err.message || err}`);
  } finally {
    if (btnLogin) {
      btnLogin.textContent = 'Iniciar sesión';
      btnLogin.disabled    = false;
    }
  }
}

if (btnLogin) btnLogin.addEventListener('click', iniciarSesion);
if (emailInput) emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') iniciarSesion(); });
if (passInput) passInput.addEventListener('keydown', e => { if (e.key === 'Enter') iniciarSesion(); });

btnLogout.addEventListener('click', () => sbAdmin.auth.signOut());

// ── Tabs ─────────────────────────────────────────────────────────
document.querySelectorAll('.adm-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('on'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('on'));
    tab.classList.add('on');
    document.getElementById(tab.dataset.tab).classList.add('on');
  });
});

// ── Utilidades ───────────────────────────────────────────────────
function setStatus(elId, msg, tipo) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className   = 'st-msg v ' + tipo;
  if (tipo === 'ok') setTimeout(() => { el.className = 'st-msg'; }, 6000);
}

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Upload de imagen a Supabase Storage ──────────────────────────
async function subirImagen(file) {
  const nombre = Date.now() + '_' + file.name.replace(/\s+/g, '_');
  const { error } = await sbAdmin.storage
    .from(BUCKET)
    .upload(nombre, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = sbAdmin.storage.from(BUCKET).getPublicUrl(nombre);
  return data.publicUrl;
}

// ── Preview de imagen al seleccionar ─────────────────────────────
function bindPreview(inputId, previewId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  let file = null;
  input.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) {
      file = f;
      preview.src          = URL.createObjectURL(f);
      preview.style.display = 'block';
    }
  });
  return () => file; // getter
}

const getEventoFile  = bindPreview('file-evento',  'ev-preview');
const getBlogFile    = bindPreview('file-blog',     'blog-preview');
const getGaleriaFile = bindPreview('file-galeria',  'galeria-preview');

// ── Eliminar genérico ─────────────────────────────────────────────
function bindEliminar(container, tabla, reloadFn) {
  container.querySelectorAll('.item-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
      const { error } = await sbAdmin.from(tabla).delete().eq('id', btn.dataset.id);
      if (error) { alert('Error: ' + error.message); return; }
      reloadFn();
    });
  });
}

// ── Renderizar lista genérica ─────────────────────────────────────
function renderLista(containerId, data, tabla, reloadFn, extraInfo) {
  const list = document.getElementById(containerId);
  if (!data || data.length === 0) {
    list.innerHTML = '<p class="empty-state">Sin publicaciones aún.</p>';
    return;
  }
  list.innerHTML = '';
  data.forEach(item => {
    const d = document.createElement('div');
    d.className = 'item-row';
    const thumbHtml = item.imagen_url || item.url
      ? `<img src="${esc(item.imagen_url || item.url)}" alt="${esc(item.titulo)}">`
      : `<div class="item-thumb"></div>`;
    d.innerHTML = `
      ${thumbHtml}
      <div class="item-info">
        <strong>${esc(item.titulo)}</strong>
        <span>${esc(extraInfo(item))}</span>
      </div>
      <button class="item-del" data-id="${esc(item.id)}">Eliminar</button>
    `;
    list.appendChild(d);
  });
  bindEliminar(list, tabla, reloadFn);
}

// ═══════════════════════════════════════════════════════════════
//  EVENTOS
// ═══════════════════════════════════════════════════════════════
document.getElementById('btn-crear-evento').addEventListener('click', async () => {
  const titulo      = document.getElementById('ev-titulo').value.trim();
  const descripcion = document.getElementById('ev-descripcion').value.trim();
  const fecha       = document.getElementById('ev-fecha').value;
  const hora        = document.getElementById('ev-hora').value;
  const tipo        = document.getElementById('ev-tipo').value;
  const estado      = document.getElementById('ev-estado').value;
  const btn         = document.getElementById('btn-crear-evento');

  if (!titulo) { setStatus('ev-status', '⚠️ El título es obligatorio.', 'err'); return; }

  btn.disabled = true;
  setStatus('ev-status', 'Guardando evento...', 'ld');

  try {
    let imagen_url = null;
    const file = getEventoFile();
    if (file) {
      setStatus('ev-status', 'Subiendo imagen...', 'ld');
      imagen_url = await subirImagen(file);
    }

    const { error } = await sbAdmin.from('eventos').insert([{
      titulo,
      descripcion: descripcion || null,
      fecha:       fecha       || null,
      hora:        hora        || null,
      imagen_url,
      tipo,
      estado
    }]);
    if (error) throw error;

    setStatus('ev-status', '✅ Evento publicado. Ya es visible en el sitio público.', 'ok');
    // Limpiar form
    ['ev-titulo', 'ev-descripcion', 'ev-fecha', 'ev-hora'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('file-evento').value = '';
    document.getElementById('ev-preview').style.display = 'none';
    cargarEventos();

  } catch (e) {
    setStatus('ev-status', '❌ Error al publicar: ' + e.message, 'err');
    console.error(e);
  } finally {
    btn.disabled     = false;
    btn.textContent  = '📅 Publicar evento';
  }
});

async function cargarEventos() {
  const list = document.getElementById('lista-eventos');
  list.innerHTML = '<p class="empty-state">Cargando...</p>';
  const { data, error } = await sbAdmin
    .from('eventos').select('*')
    .order('created_at', { ascending: false }).limit(10);
  if (error) { list.innerHTML = '<p class="empty-state">Error al cargar.</p>'; return; }
  renderLista('lista-eventos', data, 'eventos', cargarEventos,
    item => (item.tipo || '') + ' · ' + fmtFecha(item.fecha || item.created_at));
}

// ═══════════════════════════════════════════════════════════════
//  BLOG / NOTICIAS
// ═══════════════════════════════════════════════════════════════
document.getElementById('btn-publicar-blog').addEventListener('click', async () => {
  const titulo    = document.getElementById('blog-titulo').value.trim();
  const contenido = document.getElementById('blog-contenido').value.trim();
  const categoria = document.getElementById('blog-categoria').value;
  const btn       = document.getElementById('btn-publicar-blog');

  if (!titulo || !contenido) {
    setStatus('blog-status', '⚠️ Título y contenido son obligatorios.', 'err');
    return;
  }

  btn.disabled = true;
  setStatus('blog-status', 'Publicando...', 'ld');

  try {
    let imagen_url = null;
    const file = getBlogFile();
    if (file) {
      setStatus('blog-status', 'Subiendo imagen...', 'ld');
      imagen_url = await subirImagen(file);
    }

    const { error } = await sbAdmin.from('publicaciones').insert([{
      titulo, contenido, imagen_url, categoria
    }]);
    if (error) throw error;

    setStatus('blog-status', '✅ Publicación publicada. Ya es visible en el sitio.', 'ok');
    ['blog-titulo', 'blog-contenido'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('file-blog').value = '';
    document.getElementById('blog-preview').style.display = 'none';
    cargarBlog();

  } catch (e) {
    setStatus('blog-status', '❌ Error: ' + e.message, 'err');
    console.error(e);
  } finally {
    btn.disabled    = false;
    btn.textContent = '📝 Publicar noticia';
  }
});

async function cargarBlog() {
  const list = document.getElementById('lista-blog');
  list.innerHTML = '<p class="empty-state">Cargando...</p>';
  const { data, error } = await sbAdmin
    .from('publicaciones').select('*')
    .order('created_at', { ascending: false }).limit(10);
  if (error) { list.innerHTML = '<p class="empty-state">Error al cargar.</p>'; return; }
  renderLista('lista-blog', data, 'publicaciones', cargarBlog,
    item => (item.categoria || '') + ' · ' + fmtFecha(item.created_at));
}

// ═══════════════════════════════════════════════════════════════
//  GALERÍA
// ═══════════════════════════════════════════════════════════════
document.getElementById('btn-subir-galeria').addEventListener('click', async () => {
  const titulo = document.getElementById('galeria-titulo').value.trim() || 'Sin título';
  const btn    = document.getElementById('btn-subir-galeria');
  const file   = getGaleriaFile();

  if (!file) { setStatus('galeria-status', '⚠️ Selecciona una foto primero.', 'err'); return; }

  btn.disabled = true;
  setStatus('galeria-status', 'Subiendo foto...', 'ld');

  try {
    const url = await subirImagen(file);
    const { error } = await sbAdmin.from('imagenes_publicas').insert([{
      titulo, url, fecha: new Date().toISOString()
    }]);
    if (error) throw error;

    setStatus('galeria-status', '✅ Foto publicada en la galería del sitio.', 'ok');
    document.getElementById('file-galeria').value = '';
    document.getElementById('galeria-titulo').value = '';
    document.getElementById('galeria-preview').style.display = 'none';
    cargarGaleria();

  } catch (e) {
    setStatus('galeria-status', '❌ Error: ' + e.message, 'err');
    console.error(e);
  } finally {
    btn.disabled    = false;
    btn.textContent = '📸 Publicar foto';
  }
});

async function cargarGaleria() {
  const list = document.getElementById('lista-galeria');
  list.innerHTML = '<p class="empty-state">Cargando...</p>';
  const { data, error } = await sbAdmin
    .from('imagenes_publicas').select('*')
    .order('fecha', { ascending: false }).limit(12);
  if (error) { list.innerHTML = '<p class="empty-state">Error al cargar.</p>'; return; }
  // Para galería, el campo URL está en item.url (no imagen_url)
  if (!data || data.length === 0) {
    list.innerHTML = '<p class="empty-state">Sin fotos publicadas aún.</p>';
    return;
  }
  list.innerHTML = '';
  data.forEach(img => {
    const d = document.createElement('div');
    d.className = 'item-row';
    d.innerHTML = `
      <img src="${esc(img.url)}" alt="${esc(img.titulo)}">
      <div class="item-info">
        <strong>${esc(img.titulo)}</strong>
        <span>${fmtFecha(img.fecha)}</span>
      </div>
      <button class="item-del" data-id="${esc(img.id)}">Eliminar</button>
    `;
    list.appendChild(d);
  });
  bindEliminar(list, 'imagenes_publicas', cargarGaleria);
}

// ═══════════════════════════════════════════════════════════════
//  MENSAJES DE CONTACTO
// ═══════════════════════════════════════════════════════════════
async function cargarMensajes() {
  const list  = document.getElementById('msg-list');
  const badge = document.getElementById('badge-mensajes');
  list.innerHTML = '<p class="empty-state">Cargando...</p>';

  const { data, error } = await sbAdmin
    .from('contactos').select('*')
    .order('created_at', { ascending: false });

  if (error) { list.innerHTML = '<p class="empty-state">Error al cargar.</p>'; return; }
  if (!data || data.length === 0) {
    list.innerHTML = '<p class="empty-state">Aún no hay mensajes.</p>';
    badge.style.display = 'none';
    return;
  }

  const noLeidos = data.filter(m => !m.leido).length;
  badge.textContent   = noLeidos || '';
  badge.style.display = noLeidos > 0 ? 'inline' : 'none';

  list.innerHTML = '';
  data.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'msg-card' + (msg.leido ? '' : ' nuevo');
    card.innerHTML = `
      <div class="msg-top">
        <span class="msg-nombre">${esc(msg.nombre)}</span>
        <span class="msg-fecha">${fmtFecha(msg.created_at)}</span>
      </div>
      <span class="msg-chip">${esc(msg.motivo)}</span>
      <p class="msg-body">${esc(msg.mensaje)}</p>
      <p class="msg-meta">
        ✉️ <a href="mailto:${esc(msg.correo)}">${esc(msg.correo)}</a>
        ${msg.telefono ? ' · 📞 ' + esc(msg.telefono) : ''}
      </p>
      ${!msg.leido
        ? `<button class="adm-btn-mark" data-lid="${esc(msg.id)}">Marcar como leído</button>`
        : ''}
    `;
    const markBtn = card.querySelector('[data-lid]');
    if (markBtn) {
      markBtn.addEventListener('click', async () => {
        await sbAdmin.from('contactos').update({ leido: true }).eq('id', msg.id);
        cargarMensajes();
      });
    }
    list.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN GENERAL DEL SITIO
// ═══════════════════════════════════════════════════════════════
async function cargarConfiguracionAdmin() {
  try {
    const { data, error } = await sbAdmin
      .from('configuracion')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      console.warn('No se pudo obtener la configuración de la base de datos.');
      return;
    }

    // Llenar inputs con los valores actuales
    if (document.getElementById('cfg-hero-slogan')) document.getElementById('cfg-hero-slogan').value = data.hero_slogan || '';
    if (document.getElementById('cfg-hero-titulo')) document.getElementById('cfg-hero-titulo').value = data.hero_titulo || '';
    if (document.getElementById('cfg-hero-texto'))  document.getElementById('cfg-hero-texto').value  = data.hero_texto  || '';

    if (document.getElementById('cfg-qs-historia')) document.getElementById('cfg-qs-historia').value = data.qs_historia || '';
    if (document.getElementById('cfg-qs-mision'))   document.getElementById('cfg-qs-mision').value   = data.qs_mision   || '';
    if (document.getElementById('cfg-qs-vision'))   document.getElementById('cfg-qs-vision').value   = data.qs_vision   || '';
    if (document.getElementById('cfg-qs-valores'))  document.getElementById('cfg-qs-valores').value  = data.qs_valores  || '';

    if (document.getElementById('cfg-contacto-telefono'))  document.getElementById('cfg-contacto-telefono').value  = data.contacto_telefono  || '';
    if (document.getElementById('cfg-contacto-correo'))    document.getElementById('cfg-contacto-correo').value    = data.contacto_correo    || '';
    if (document.getElementById('cfg-contacto-ubicacion')) document.getElementById('cfg-contacto-ubicacion').value = data.contacto_ubicacion || '';

  } catch (err) {
    console.error('Error al cargar configuración en admin:', err);
  }
}

async function guardarConfiguracion() {
  const btn = document.getElementById('btn-guardar-config');
  if (!btn) return;

  btn.disabled = true;
  setStatus('config-status', 'Guardando cambios del sitio...', 'ld');

  const updates = {
    hero_slogan:        document.getElementById('cfg-hero-slogan')?.value.trim() || null,
    hero_titulo:        document.getElementById('cfg-hero-titulo')?.value.trim() || null,
    hero_texto:         document.getElementById('cfg-hero-texto')?.value.trim()  || null,
    qs_historia:        document.getElementById('cfg-qs-historia')?.value.trim() || null,
    qs_mision:          document.getElementById('cfg-qs-mision')?.value.trim()   || null,
    qs_vision:          document.getElementById('cfg-qs-vision')?.value.trim()   || null,
    qs_valores:         document.getElementById('cfg-qs-valores')?.value.trim()  || null,
    contacto_telefono:  document.getElementById('cfg-contacto-telefono')?.value.trim()  || null,
    contacto_correo:    document.getElementById('cfg-contacto-correo')?.value.trim()    || null,
    contacto_ubicacion: document.getElementById('cfg-contacto-ubicacion')?.value.trim() || null,
    updated_at:         new Date().toISOString()
  };

  try {
    const { error } = await sbAdmin
      .from('configuracion')
      .update(updates)
      .eq('id', 1);

    if (error) throw error;
    setStatus('config-status', '✅ Cambios generales del sitio guardados con éxito. Se verán reflejados al recargar el sitio público.', 'ok');
  } catch (err) {
    console.error('Error al guardar configuración:', err);
    setStatus('config-status', '❌ Error al guardar los cambios: ' + err.message, 'err');
  } finally {
    btn.disabled = false;
  }
}

// Enlazar botón de guardado
const btnGuardarConfig = document.getElementById('btn-guardar-config');
if (btnGuardarConfig) {
  btnGuardarConfig.addEventListener('click', guardarConfiguracion);
}

