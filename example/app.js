var history2 = require('..');
var target = document.getElementById('target');

function render(file) {
  var req = new XMLHttpRequest();
  req.open('GET', file, true);

  req.onload = function() {
    if(req.status >= 200 && req.status < 400) {
      target.innerHTML = marked(req.responseText);
    }
  };

  req.send();
}

function notFound() {
  target.innerHTML = 'not found';
}

function route(path) {
  if(path === '/hello') render('hello.md');
  else if(path === '/world') render('world.md');
  else notFound();
}

var path = history2.init({
  // mode: 'hashbang',
  basePath: '/example'
});

route(path);

document.body.addEventListener('click', function(e) {
  if(e.target.classList.contains('j-link')) {
    e.preventDefault();
    var href = e.target.getAttribute('href');
    route(href);
    history2.change(href);
  }
});

history2.sub('change', function(path) {
  route(path);
});

history2.start();
window.history2 = history2;
