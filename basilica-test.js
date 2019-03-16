let url = 'https://api.flickr.com/services/rest/?format=json&nojsoncallback=1&api_key=a96d92128c3ae09f2f79141b1aac9637&method=flickr.photos.search&sort=relevance&text=';

let photos = [];

let board = document.getElementById('board');

function search(str, cb) {
  fetch(url + encodeURIComponent(str)).then(r => r.json().then(cb));
}

function load(p) {
  var i = document.createElement('img');
  i.setAttribute('src', thumb(p, 's'));
  position(i, [Math.random(), Math.random()]);
  i.style.opacity = '0.2';
  board.appendChild(i);
  p.view = i;
  photos.push(p);
  setTimeout(()=>loaddata(p),0);
}

let basil = '/embed/images/generic/default'

function encodeimage(u, cb) {
  fetch(u, {mode: 'no-cors'}).then(r => r.text().then(t => cb(btoa(t))));
}

function loaddata(p) {
  encodeimage(thumb(p,'-'), image => {
    fetch(basil, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa('c5a67cf3-e490-6bf0-053d-09c26063cd3c:')
      },
      body: JSON.stringify({
        dimensions: 4,
        data: [image] })}).then(
        r => savedata(p, r.json()));
  });
}

function savedata(p, d) {
  console.log(d);
}

function position(i, p) {
  i.style.left=(p[0] * 100) + '%';
  i.style.top=(p[1] * 100) + '%';
}

function thumb(p,t) {
  return `https://farm${p.farm}.staticflickr.com/${p.server}/${p.id}_${p.secret}_${t}.jpg`;
}

search('moustache', r => {
  for (p of r.photos.photo) {
    load(p);
    break;
  }
});
