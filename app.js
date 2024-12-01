const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

// Configuración de Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Crear servidor HTTP y adjuntar socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Middleware para poder leer datos de formularios
app.use(express.urlencoded({ extended: true }));

// Lista de productos en memoria
let products = [
    { name: 'Producto 1', price: 100 },
    { name: 'Producto 2', price: 200 },
];

// Conexión de WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    socket.emit('productos', products);

    // Agregar producto
    socket.on('add-product', (product) => {
        products.push(product);
        io.emit('productos', products);  // Enviar la lista de productos a todos los clientes
    });

    // Eliminar producto
    socket.on('delete-product', (productName) => {
        products = products.filter(product => product.name !== productName);
        io.emit('productos', products);  // Enviar la lista actualizada
    });
});

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.render('home', { products });
});

// Ruta para agregar un nuevo producto
app.post('/add-product', (req, res) => {
    const { name, price } = req.body;
    products.push({ name, price: parseFloat(price) });
    res.redirect('/');
});

// Ruta para eliminar un producto
app.post('/delete-product', (req, res) => {
    const { name } = req.body;
    products = products.filter(product => product.name !== name);
    res.redirect('/');
});

// Iniciar servidor con socket.io
server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});