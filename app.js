const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');
const app = express();

// Configuración de la sesión
app.use(session({
    secret: 'p3-JBRR#Hola-SesionesPersistentes', // Secreto para firmar la cookie de sesión
    resave: false,              // No resguarda la sesión si no ha sido modificado
    saveUninitialized: false,   // No guardar la sesión si no ha sido inicializada
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }   // Usar secure: true solo si usas HTTPS
}));

// Middleware para mostrar detalles de la sesión
app.use((req, res, next) => {
    if (req.session) {
        if (!req.session.createdAt) {
            req.session.createdAt = new Date(); // Asignamos la fecha de creación de la sesión
        }
        req.session.lastAccess = new Date(); // Asignamos la última vez que se accedió a la sesión
    }
    next();
});

app.get('/login',(req, res)=>{
    if(!req.session.createdAt){
        req.session.createdAt = new Date();
        req.session.lastAccess=new Date();
        res.send('La sesion ha sido iniciada.');
    }else{
        res.send('Ya existe una sesion');
    }
});

app.get('/update',(req,res)=>{
    if(req.session.createdAt){
        req.session.lastAccess = new Date();
        res.send('La fecha de ultio acceso a sido actualizada.');
    }else{
        res.send('No hay una sesion activa');
    }
});

app.get('/status',(req, res)=>{
    if(req.session.createdAt){
        const now = new Date();
        const started = new Date(req.session.createdAt);
        const lastUpdate = new Date(req.session.lastAccess);

        const sessionAgeMs = now - started;
        const hours = Math.floor(sessionAgeMs/(1000 * 60 *60));
        const minutes = Math.floor((sessionAgeMs%(1000*60))/(1000*60));
        const seconds = Math.floor((sessionAgeMs%(1000*60))/1000);

        const inicioCDMX = moment(inicio).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        const ultimoAccesoCDMX = moment(ultimoAcceso).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

        res.json({
            inicioCDMX,
            ultimoAccesoCDMX,
            antiguedad:{Hora:hours, minutos:minutes, segundos:seconds}
        });
    }
});

// Ruta para mostrar la información de la sesión
app.get('/session', (req, res) => {
    if (req.session) {
        const sessionId = req.session.id;
        const createdAt = req.session.createdAt;
        const lastAccess = req.session.lastAccess;
        const sessionDuration = (new Date() - new Date(createdAt)) / 1000; // Duración de la sesión en segundos

        res.send(`
            <h1>Detalles de la sesión</h1>
            <p><strong>ID de sesión:</strong> ${sessionId}</p>
            <p><strong>Usuario:Jonathan</strong> </p>
            <p><strong>Fecha de creación de la sesión:</strong> ${createdAt}</p>
            <p><strong>Último acceso:</strong> ${lastAccess}</p>
            <p><strong>Duración de la sesión (en segundos):</strong> ${sessionDuration}</p>
        `);
    } else {
        res.send(`<h1>Sesión cerrada exitosamente.</h1>`);
    }
});

// Ruta para cerrar la sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error al cerrar sesión.');
        }
        res.send('<h1>Sesión cerrada exitosamente.</h1>');
    });
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
