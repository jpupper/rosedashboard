const CONFIG = {
    isLocal: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    get apiUrl() {
        return this.isLocal ? 'http://localhost:3343/rose' : 'https://vps-4455523-x.dattaweb.com/rose';
    },
    get frontendUrl() {
        return this.isLocal ? 'http://localhost:3343/rose' : 'https://jeyder.com.ar/rose';
    },
    get basePath() {
        return '/rose';
    },
    getPath(path) {
        return `${this.basePath}${path}`;
    }
};

// Para mantener compatibilidad con el código existente
window.appConfig = CONFIG;
