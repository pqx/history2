var path = require('path');
var fs = require('fs');
var http = require('http');

var server = http.createServer(function(req, res) {

  if(req.url === '/hello.md') fs.createReadStream(path.join(__dirname, 'hello.md')).pipe(res);
  else if(req.url === '/world.md') fs.createReadStream(path.join(__dirname, 'world.md')).pipe(res);
  else fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
});

server.listen(7788, function() {
  console.log('server on 7788');
});
