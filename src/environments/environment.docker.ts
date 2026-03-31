// Environment para Docker local
// El frontend en Docker usa proxy (Nginx o ng serve) para redirigir /api al backend container

export const environment = {
  production: false,
  API: '/api',
  URL_MTCORP: '/api/',
  SAP_API: 'http://192.168.0.123:4100/api'
};
