// =============================================
// db.gs — Capa de Datos FreeCourts
// Responsabilidad: TODAS las operaciones CRUD
// contra Google Spreadsheet.
// =============================================

// ─── AUTENTICACIÓN ─────────────────────────────────────────────
function registrarUsuario(nombre, correo, telefono, contrasena) {
  try {
    const sheet    = getSheet(SHEETS.USUARIOS);
    const usuarios = sheetToObjects(sheet);
    if (usuarios.find(u => u.Correo === correo))
      return { success: false, message: 'El correo ya está registrado' };

    const id         = generateId('U');
    const hashedPass = Utilities.base64Encode(contrasena);
    sheet.appendRow([id, nombre, correo, telefono, hashedPass, 'usuario', new Date().toISOString(), 'Activo']);
    return { success: true, usuario: { id, nombre, correo, rol: 'usuario' } };
  } catch(e) { return { success: false, message: e.message }; }
}

function iniciarSesion(correo, contrasena) {
  try {
    const sheet      = getSheet(SHEETS.USUARIOS);
    const hashedPass = Utilities.base64Encode(contrasena);
    const usuario    = sheetToObjects(sheet)
      .find(u => u.Correo === correo && u.Contrasena === hashedPass && u.Estado === 'Activo');
    if (!usuario) return { success: false, message: 'Correo o contraseña incorrectos' };
    return {
      success: true,
      usuario: {
        id:       usuario.ID_Usuario,
        nombre:   usuario.Nombre,
        correo:   usuario.Correo,
        telefono: usuario.Telefono,
        rol:      usuario.Rol
      }
    };
  } catch(e) { return { success: false, message: e.message }; }
}

// ─── CANCHAS ───────────────────────────────────────────────────
function getCanchas() {
  try {
    return { success: true, data: sheetToObjects(getSheet(SHEETS.CANCHAS)) };
  } catch(e) { return { success: false, message: e.message }; }
}

function getCanchaById(id) {
  try {
    const cancha = sheetToObjects(getSheet(SHEETS.CANCHAS)).find(c => c.ID_Cancha === id);
    if (!cancha) return { success: false, message: 'Cancha no encontrada' };
    const reportes = getReportesByCancha(id);
    const ultimo   = reportes.data?.length > 0 ? reportes.data[reportes.data.length - 1] : null;
    if (ultimo) {
      cancha.Cantidad_personas  = ultimo.Cantidad_personas;
      cancha.Ultimo_comentario  = ultimo.Comentario;
    }
    return { success: true, data: cancha };
  } catch(e) { return { success: false, message: e.message }; }
}

function actualizarEstadoCancha(idCancha, nuevoEstado) {
  try {
    const sheet   = getSheet(SHEETS.CANCHAS);
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol   = headers.indexOf('ID_Cancha');
    const estCol  = headers.indexOf('Estado_cancha');
    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === idCancha) {
        sheet.getRange(i + 1, estCol + 1).setValue(nuevoEstado);
        return { success: true };
      }
    }
    return { success: false, message: 'Cancha no encontrada' };
  } catch(e) { return { success: false, message: e.message }; }
}

function agregarCancha(nombre, ubicacion, tipo, latitud, longitud, capacidad, precio) {
  try {
    const id = generateId('C');
    getSheet(SHEETS.CANCHAS).appendRow([
      id, nombre, ubicacion, tipo, 'Libre',
      latitud, longitud, capacidad, precio || 'Gratis',
      new Date().toISOString()
    ]);
    return { success: true, id };
  } catch(e) { return { success: false, message: e.message }; }
}

// ─── REPORTES ──────────────────────────────────────────────────
function enviarReporte(idUsuario, idCancha, estadoReporte, cantPersonas, comentario) {
  try {
    const id = generateId('R');
    getSheet(SHEETS.REPORTES).appendRow([
      id, idUsuario, idCancha, estadoReporte,
      cantPersonas, comentario, new Date().toISOString(), 'Pendiente'
    ]);
    actualizarEstadoCancha(idCancha, estadoReporte);
    return { success: true, id, message: 'Reporte enviado correctamente' };
  } catch(e) { return { success: false, message: e.message }; }
}

function getReportesByCancha(idCancha) {
  try {
    const filtrados = sheetToObjects(getSheet(SHEETS.REPORTES))
      .filter(r => r.ID_Cancha === idCancha);
    return { success: true, data: filtrados };
  } catch(e) { return { success: false, message: e.message }; }
}

function getReportes() {
  try {
    return { success: true, data: sheetToObjects(getSheet(SHEETS.REPORTES)) };
  } catch(e) { return { success: false, message: e.message }; }
}

function validarReporte(idReporte, accion) {
  try {
    const sheet      = getSheet(SHEETS.REPORTES);
    const data       = sheet.getDataRange().getValues();
    const headers    = data[0];
    const idCol      = headers.indexOf('ID_Reporte');
    const validCol   = headers.indexOf('Validado');
    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === idReporte) {
        sheet.getRange(i + 1, validCol + 1).setValue(accion);
        return { success: true };
      }
    }
    return { success: false, message: 'Reporte no encontrado' };
  } catch(e) { return { success: false, message: e.message }; }
}

// ─── PARTIDOS ──────────────────────────────────────────────────
function crearPartido(idUsuario, idCancha, fechaHora, jugadoresMax, deporte, nombrePartido) {
  try {
    const id = generateId('P');
    getSheet(SHEETS.PARTIDOS).appendRow([
      id, idUsuario, idCancha, fechaHora,
      'Abierto', jugadoresMax, 1, deporte, nombrePartido
    ]);
    return { success: true, id, message: 'Partido creado correctamente' };
  } catch(e) { return { success: false, message: e.message }; }
}

function getPartidos() {
  try {
    const partidos  = sheetToObjects(getSheet(SHEETS.PARTIDOS));
    const canchaMap = {};
    sheetToObjects(getSheet(SHEETS.CANCHAS)).forEach(c => canchaMap[c.ID_Cancha] = c);
    const enriched  = partidos.map(p => ({
      ...p,
      Cancha_nombre:    canchaMap[p.ID_Cancha]?.Nombre    || 'Desconocida',
      Cancha_ubicacion: canchaMap[p.ID_Cancha]?.Ubicacion || ''
    }));
    return { success: true, data: enriched };
  } catch(e) { return { success: false, message: e.message }; }
}

function unirsePartido(idPartido, idUsuario) {
  try {
    const sheet      = getSheet(SHEETS.PARTIDOS);
    const data       = sheet.getDataRange().getValues();
    const headers    = data[0];
    const idCol      = headers.indexOf('ID_Partido');
    const actCol     = headers.indexOf('Jugadores_actuales');
    const maxCol     = headers.indexOf('Jugadores_max');
    const estCol     = headers.indexOf('Estado_partido');
    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol] === idPartido) {
        const actuales = parseInt(data[i][actCol]) || 0;
        const max      = parseInt(data[i][maxCol])  || 10;
        if (actuales >= max) return { success: false, message: 'El partido está lleno' };
        sheet.getRange(i + 1, actCol + 1).setValue(actuales + 1);
        if (actuales + 1 >= max) sheet.getRange(i + 1, estCol + 1).setValue('Lleno');
        return { success: true, message: 'Te uniste al partido' };
      }
    }
    return { success: false, message: 'Partido no encontrado' };
  } catch(e) { return { success: false, message: e.message }; }
}

// ─── DASHBOARD ADMIN ───────────────────────────────────────────
function getDashboardStats() {
  try {
    const canchas  = sheetToObjects(getSheet(SHEETS.CANCHAS));
    const reportes = sheetToObjects(getSheet(SHEETS.REPORTES));
    const partidos = sheetToObjects(getSheet(SHEETS.PARTIDOS));
    const usuarios = sheetToObjects(getSheet(SHEETS.USUARIOS));
    const hoy      = new Date().toDateString();
    return {
      success: true,
      data: {
        totalCanchas:    canchas.length,
        libres:          canchas.filter(c => c.Estado_cancha === 'Libre').length,
        incompletas:     canchas.filter(c => c.Estado_cancha === 'Incompleto').length,
        ocupadas:        canchas.filter(c => c.Estado_cancha === 'Ocupado').length,
        totalUsuarios:   usuarios.length,
        reportesHoy:     reportes.filter(r => new Date(r.Fecha_hora).toDateString() === hoy).length,
        sinRevisar:      reportes.filter(r => r.Validado === 'Pendiente').length,
        partidosActivos: partidos.filter(p => ['Abierto','Lleno'].includes(p.Estado_partido)).length,
        canchas, reportes, partidos, usuarios
      }
    };
  } catch(e) { return { success: false, message: e.message }; }
}

function getUsuarios() {
  try {
    const usuarios = sheetToObjects(getSheet(SHEETS.USUARIOS))
      .map(u => ({ ...u, Contrasena: '***' }));
    return { success: true, data: usuarios };
  } catch(e) { return { success: false, message: e.message }; }
}
