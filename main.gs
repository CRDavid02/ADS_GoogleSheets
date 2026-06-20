// =============================================
// main.gs — Controlador Principal FreeCourts
// Responsabilidad: Entry point, routing y utils
// =============================================

const SHEETS = {
  USUARIOS:       'Usuarios',
  CANCHAS:        'Canchas',
  REPORTES:       'Reportes',
  PARTIDOS:       'Partidos',
  NOTIFICACIONES: 'Notificaciones'
};

// ─── ENTRY POINT ───────────────────────────────────────────────
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('FreeCourts')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─── SETUP INICIAL ─────────────────────────────────────────────
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configs = [
    { name: SHEETS.USUARIOS,       headers: ['ID_Usuario','Nombre','Correo','Telefono','Contrasena','Rol','FechaRegistro','Estado'] },
    { name: SHEETS.CANCHAS,        headers: ['ID_Cancha','Nombre','Ubicacion','Tipo_deporte','Estado_cancha','Latitud','Longitud','Capacidad','Precio','FechaRegistro'] },
    { name: SHEETS.REPORTES,       headers: ['ID_Reporte','ID_Usuario','ID_Cancha','Estado_reporte','Cantidad_personas','Comentario','Fecha_hora','Validado'] },
    { name: SHEETS.PARTIDOS,       headers: ['ID_Partido','ID_Usuario','ID_Cancha','FechaHora','Estado_partido','Jugadores_max','Jugadores_actuales','Deporte','Nombre_partido'] },
    { name: SHEETS.NOTIFICACIONES, headers: ['ID_Notificacion','ID_Usuario','Mensaje','Tipo','Fecha','Leido'] }
  ];

  configs.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.getRange(1, 1, 1, cfg.headers.length).setValues([cfg.headers]);
      sheet.getRange(1, 1, 1, cfg.headers.length)
        .setBackground('#1a7a3c').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });

  const canchasSheet = ss.getSheetByName(SHEETS.CANCHAS);
  if (canchasSheet.getLastRow() <= 1) seedCanchas(canchasSheet);

  return { success: true, message: 'Hojas configuradas correctamente' };
}

function seedCanchas(sheet) {
  const canchas = [
    ['C001','Cancha Las Flores','Jr. Huancaro 240, San Jerónimo','Fútbol','Libre',-13.5350,-71.9100,10,'Gratis',new Date().toISOString()],
    ['C002','Polideportivo SJ','Av. Principal 450, San Jerónimo','Básquet','Incompleto',-13.5370,-71.9080,10,'Gratis',new Date().toISOString()],
    ['C003','Losa San Blas','Jr. San Blas 120, San Jerónimo','Vóley','Ocupado',-13.5330,-71.9120,12,'Gratis',new Date().toISOString()],
    ['C004','Estadio Municipal','Av. Cusco 800, San Jerónimo','Fútbol','Libre',-13.5360,-71.9090,22,'Gratis',new Date().toISOString()],
    ['C005','Cancha La Cajona','Pasaje Cajona 55, San Jerónimo','Fútbol','Incompleto',-13.5345,-71.9110,14,'Gratis',new Date().toISOString()],
  ];
  sheet.getRange(2, 1, canchas.length, canchas[0].length).setValues(canchas);
}

// ─── HELPERS COMPARTIDOS ───────────────────────────────────────
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) { setupSheets(); sheet = ss.getSheetByName(name); }
  return sheet;
}

function generateId(prefix) {
  return prefix + Date.now().toString(36).toUpperCase();
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
