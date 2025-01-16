const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');
const app = express();

// Configuración de la sesión
app.use(session({
    secret: 'p3-JBRR#Hola-SesionesPersistentes', // Secreto para firmar la cookie de sesión
    resave: false,              // No resguardar la sesión si no ha sido modificada
    saveUninitialized: false,   // No guardar la sesión si no ha sido inicializada
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // Usar secure: true solo si usas HTTPS
}));

// Middleware para inicializar propiedades de la sesión
app.use((req, res, next) => {
    if (req.session) {
        if (!req.session.createdAt) {
            req.session.createdAt = new Date(); // Fecha de creación de la sesión
        }
        req.session.lastAccess = new Date(); // Último acceso a la sesión
    }
    next();
});

// Ruta para iniciar sesión
app.get('/login', (req, res) => {
    if (!req.session.createdAt) {
        req.session.createdAt = new Date();
        req.session.lastAccess = new Date();
        res.send('La sesión ha sido iniciada.');
    } else {
        res.send('Ya existe una sesión activa.');
    }
});

// Ruta para actualizar el último acceso
app.get('/update', (req, res) => {
    if (req.session.createdAt) {
        req.session.lastAccess = new Date();
        res.send('La fecha de último acceso ha sido actualizada.');
    } else {
        res.send('No hay una sesión activa.');
    }
});

// Ruta para obtener el estado de la sesión
app.get('/status', (req, res) => {
    if (req.session.createdAt) {
        const now = new Date();
        const started = new Date(req.session.createdAt);
        const lastUpdate = new Date(req.session.lastAccess);

        const sessionAgeMs = now - started;
        const hours = Math.floor(sessionAgeMs / (1000 * 60 * 60));
        const minutes = Math.floor((sessionAgeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((sessionAgeMs % (1000 * 60)) / 1000);

        const inicioCDMX = moment(started).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        const ultimoAccesoCDMX = moment(lastUpdate).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

        res.json({
            inicioCDMX,
            ultimoAccesoCDMX,
            antiguedad: {
                horas: hours,
                minutos: minutes,
                segundos: seconds
            }
        });
    } else {
        res.status(404).json({ error: 'No hay una sesión activa.' });
    }
});

// Ruta para mostrar los detalles de la sesión
app.get('/session', (req, res) => {
    if (req.session.createdAt) {
        const sessionId = req.session.id;
        const createdAt = req.session.createdAt;
        const lastAccess = req.session.lastAccess;
        const sessionDuration = Math.floor((new Date() - new Date(createdAt)) / 1000); // Duración en segundos

        res.send(`
            <h1>Detalles de la sesión</h1>
            <p><strong>ID de sesión:</strong> ${sessionId}</p>
            <p><strong>Usuario:</strong> Jonathan</p>
            <p><strong>Fecha de creación de la sesión:</strong> ${createdAt}</p>
            <p><strong>Último acceso:</strong> ${lastAccess}</p>
            <p><strong>Duración de la sesión (en segundos):</strong> ${sessionDuration}</p>
        `);
    } else {
        res.send('<h1>No hay una sesión activa.</h1>');
    }
});

// Ruta para cerrar la sesión
app.get('/logout', (req, res) => {
    if (req.session.createdAt) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Error al cerrar la sesión.');
            }
            res.send('Sesión cerrada correctamente.');
        });
    } else {
        res.send('No hay una sesión activa para cerrar.');
    }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
