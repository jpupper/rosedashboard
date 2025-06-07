const config = {
    development: {
        apiUrl: 'http://localhost:3343'
    },
    production: {
        apiUrl: 'https://vps-4455523-x.dattaweb.com/rose'
    }
};

// Cambiar esto según el entorno (development o production)
const environment = 'development';

// Exportar la configuración del entorno actual
const currentConfig = config[environment];

// Para usar en otros archivos
window.appConfig = currentConfig;
