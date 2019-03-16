let url = 'https://api.flickr.com/services/rest/?format=json&nojsoncallback=1&api_key=a96d92128c3ae09f2f79141b1aac9637&method=flickr.photos.search&sort=relevance&text=';

let photos = [];

let board = document.getElementById('board');

function search(str, cb) {
  fetch(url + encodeURIComponent(str)).then(r => r.json().then(cb));
}

function load(p) {
  var i = document.createElement('img');
  i.setAttribute('src', thumb(p, '_s'));
  position(i, [Math.random(), Math.random()]);
  i.style.opacity = '0.2';
  board.appendChild(i);
  p.view = i;
  photos.push(p);
  setTimeout(()=>loaddata(p),0);
}

let basil = '/embed/images/generic/default'

function encodeimage(u, cb) {
  fetch(u, {mode: 'no-cors'}).then(r => r.blob().then(b => blob2b64(b, cb)));
}

function blob2b64(b, cb) {
  r = new FileReader();
  // data:*/*;base64,BASE/64==
  r.onload = e => cb(e.target.result.split(',')[1]);
  d = r.readAsDataURL(b);
}

function loaddata(p) {
  encodeimage(thumb(p,''), image => {
    fetch(basil, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa('c5a67cf3-e490-6bf0-053d-09c26063cd3c:'),
        "content-type": "application/json"
        //Authorization: 'Basic ' + btoa('SLOW_DEMO_KEY:')
      },
      body: JSON.stringify({
        // dimensions: 4,
        data: [{img: image}] })}).then(
        r => r.json().then(d => savedata(p, d)));
  });
}

function savedata(p, d) {
  p.view.style.opacity = 1;
  p.data = d;
  repositionall();
}

let lasttime = new Date();
let waiting = false;
function repositionall(force) {
  if (waiting && !force) {
    return;
  }
  let now = new Date();
  if (now - lasttime < 500) {
    waiting = true;
    setTimeout(() => repositionall(true), 100);
    return;
  }
  waiting = false;
  
  let data = [];
  for (p of photos) {
    data.push(p.data);
  }
  let a = new PCA(data);
  console.log(a.predict(data));
  console.log(a.getExplainedVariance());
  console.log(a.getExplainedVariance());
}

function position(i, p) {
  i.style.left=(p[0] * 100) + '%';
  i.style.top=(p[1] * 100) + '%';
}

function thumb(p,t) {
  return `/flickr/farm${p.farm}/${p.server}/${p.id}_${p.secret}${t}.jpg`;
}

search(window.location.hash.substring(1), r => {
  for (p of r.photos.photo.slice(0,5)) {
    load(p);
  }
});
