// =============================================
// services.gs — Servicios Externos FreeCourts
// Responsabilidad: Orquestar llamadas a APIs
// externas. db.gs y main.gs no deben llamar
// directamente a UrlFetchApp.
// =============================================

// ─── CONFIGURACIÓN DE APIS ─────────────────────────────────────
const API_KEYS = {
  GOOGLE_MAPS: PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_KEY') || '',
  PAYMENT_GW:  PropertiesService.getScriptProperties().getProperty('PAYMENT_GW_KEY')  || '',
  MESSAGING:   PropertiesService.getScriptProperties().getProperty('MESSAGING_KEY')   || '',
  WEATHER:     PropertiesService.getScriptProperties().getProperty('WEATHER_KEY')     || '',
};

// ─── GOOGLE MAPS — Geocoding ────────────────────────────────────
/**
 * Convierte una dirección en coordenadas lat/lng.
 * TODO: Activar cuando se integre Google Maps API
 */
function geocodeAddress(address) {
  /*
  const url  = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEYS.GOOGLE_MAPS}`;
  const resp = UrlFetchApp.fetch(url);
  const data = JSON.parse(resp.getContentText());
  if (data.status === 'OK') {
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  }
  */
  Logger.log('[services.gs] geocodeAddress: API no configurada aún.');
  return null;
}

/**
 * Calcula distancia en km entre dos coordenadas (Haversine).
 * Utilidad pura — no requiere API externa.
 */
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat/2)**2
             + Math.cos(lat1 * Math.PI/180)
             * Math.cos(lat2 * Math.PI/180)
             * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── PASARELA DE PAGO ──────────────────────────────────────────
/**
 * Inicializa un pago para reserva de cancha.
 * TODO: Integrar Stripe / Culqi / MercadoPago
 */
function iniciarPago(payload) {
  /*
  const url     = 'https://api.payment-gateway.com/v1/checkout';
  const options = {
    method:      'post',
    contentType: 'application/json',
    headers:     { 'Authorization': `Bearer ${API_KEYS.PAYMENT_GW}` },
    payload:     JSON.stringify(payload)
  };
  const resp = UrlFetchApp.fetch(url, options);
  return JSON.parse(resp.getContentText());
  */
  Logger.log('[services.gs] iniciarPago: Pasarela no configurada aún.');
  return { success: false, error: 'Pasarela de pago no configurada' };
}

// ─── SERVICIO DE MENSAJERÍA ────────────────────────────────────
/**
 * Envía una notificación al usuario.
 * TODO: Integrar Twilio / Firebase Cloud Messaging
 */
function enviarNotificacion(params) {
  /*
  const canal = params.canal || 'email';
  if (canal === 'sms')  { ... integración Twilio ... }
  if (canal === 'push') { ... integración FCM ...   }
  */
  Logger.log(`[services.gs] enviarNotificacion: no configurada. Mensaje: ${params.mensaje}`);
  return { success: false, error: 'Servicio de mensajería no configurado' };
}

// ─── CLIMA / CONDICIONES DE JUEGO ──────────────────────────────
/**
 * Consulta el clima actual en la ubicación de una cancha.
 * TODO: Integrar OpenWeatherMap
 */
function getClima(lat, lng) {
  /*
  const url  = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEYS.WEATHER}&units=metric&lang=es`;
  const resp = UrlFetchApp.fetch(url);
  return JSON.parse(resp.getContentText());
  */
  Logger.log('[services.gs] getClima: API de clima no configurada aún.');
  return null;
}
