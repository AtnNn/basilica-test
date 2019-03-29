var PCA = require('pca-js');
// var eml = require('emlapack');

let url = 'https://api.flickr.com/services/rest/?format=json&nojsoncallback=1&api_key=a96d92128c3ae09f2f79141b1aac9637&method=flickr.photos.search&sort=relevance&text=';

let photos = [];

let board = document.getElementById('board');

function search(str, cb) {
  fetch(url + encodeURIComponent(str)).then(r => r.json().then(r => cb(r.photos.photo.slice(0, 100))));
}

function searches(strs, cb) {
  for (let s of strs) {
    search(s, cb);
  }
}

function small(i, p) {
  i.setAttribute('src', thumb(p, '_s'));
}

function big(i, p) {
  i.parentNode.appendChild(i);
  i.setAttribute('src', thumb(p, ''));
}

function load(p) {
  var i = document.createElement('img');
  small(i, p);
  position(i, [Math.random(), Math.random()]);
  i.style.opacity = '0.2';
  i.onmousedown = () => big(i, p);
  i.onmouseup = () => small(i, p);
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
        dimensions: 100, 
        data: [{img: image}] })}).then(
        r => r.json().then(d => savedata(p, d)));
  });
}

function savedata(p, d) {
  p.view.style.opacity = 0.5;
  p.data = d.embeddings[0];
  repositionall();
}

let lasttime = new Date();
let waiting = false;
function repositionall(force) {
  if (waiting && !force) {
    return;
  }
  let now = new Date();
  if (now - lasttime < 2000) {
    waiting = true;
    setTimeout(() => repositionall(true), 1000);
    return;
  }
  waiting = false;
  
  let data = [];
  let ix = [];
  for (i in photos) {
    if(photos[i].data) {
      data.push(photos[i].data);
      ix.push(i);
    }
  }
  if (ix.length <= 3) {
    return;
  }

  lasttime = now;
  let ev = PCA.getEigenVectors(data);
  let one = PCA.computeAdjustedData(data, ev[0]).adjustedData[0];
  let two = PCA.computeAdjustedData(data, ev[1]).adjustedData[0];
  let ps = [];
  let omin = 99999;
  let omax = -99999;
  let tmin = 99999;
  let tmax = -99999;
  for (i in one) {
    ps.push([one[i], two[i]]);
    omin = Math.min(omin, one[i]);
    omax = Math.max(omax, one[i]);
    tmin = Math.min(tmin, two[i]);
    tmax = Math.max(tmax, two[i]);
  }
  let oscale = omax - omin;
  let tscale = tmax - tmin;
  for (i in ps) {
    photos[ix[i]].view.style.opacity = 1;
    position(photos[ix[i]].view, [(ps[i][0]-omin)/oscale, (ps[i][1]-tmin)/tscale]);
  }
}

function position(i, p) {
  i.style.left=(p[0] * 100) + '%';
  i.style.top=(p[1] * 100) + '%';
}

function thumb(p,t) {
  return `/flickr/farm${p.farm}/${p.server}/${p.id}_${p.secret}${t}.jpg`;
}

let keywords = window.location.hash.substring(1).split(',');
searches(keywords, r => {
  for (p of r.slice(0, 48/keywords.length)) {
    load(p);
  }
});
