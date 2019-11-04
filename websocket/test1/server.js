const fastify = require('fastify')({
  ignoreTrailingSlash: true
})
const path = require('path');

fastify.register(require('fastify-websocket'),{
  options: {
    path: '/echo', // we accept only connections matching this path e.g.: ws://localhost:3000/echo
    verifyClient: function (info, next) {/*
      if (info.req.headers['x-fastify-header'] !== 'fastify is awesome !') {
        return next(false) // the connection is not allowed
      }*/
      next(true) // the connection is allowed
    }
  }
});
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'static'),
  // serve: false // se si digita http://ip/index.html il server non dà risposta
});

fastify.get('/echo', { websocket: true }, (connection, req) => {
  connection.socket.on('message', message => {
    // message === 'hi from client'
    connection.socket.send('Il server ha ricevuto: '+message)
  })
  setInterval(()=>{
    connection.write('we raga')
  },4000);
});

fastify.listen(3000, err => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});