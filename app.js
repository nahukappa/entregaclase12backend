const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

//configuracion de handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

//crear servidor HTTP y adjuntar socket.io
const server = http.createServer(app);
const io = socketIo(server);

//emitir lista de productos a los clientes conectados
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');
    socket.emit('productos', products);  //enviar productos al cliente

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
    });
});

//ruta para la pagina de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products });
});

//middleware para poder leer datos de formularios
app.use(express.urlencoded({ extended: true }));

//lista de productos en memoria
let products = [
    { name: 'Producto 1', price: 100 },
    { name: 'Producto 2', price: 200 },
];

//conexión de websocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    socket.emit('productos', products);

    //agregar producto
    socket.on('add-product', (product) => {
        products.push(product);
        io.emit('productos', products);  //enviar la lista de productos a todos los clientes
    });

    //eliminar producto
    socket.on('delete-product', (productName) => {
        products = products.filter(product => product.name !== productName);
        io.emit('productos', products);  //enviar la lista actualizada
    });
});

//ruta para la pagina de inicio
app.get('/', (req, res) => {
    res.render('home', { products });
});

//ruta para agregar un nuevo producto
app.post('/add-product', (req, res) => {
    const { name, price } = req.body;
    products.push({ name, price: parseFloat(price) });
    res.redirect('/');
});

//ruta para eliminar un producto
app.post('/delete-product', (req, res) => {
    const productName = req.body.name;
    //eliminar el producto del array 'products'
    products = products.filter(product => product.name !== productName);
    io.emit('productos', products);  //enviar lista actualizada a todos los clientes
    res.redirect('/realtimeproducts');  //redirigir de nuevo a la pagina en tiempo real
});


//iniciar servidor con socket.io
server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
