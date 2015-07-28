'use strict';

function get(url) {
  return new Promise(function(resolve, reject) {
    console.log(`Grabbing: ${url}`);
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
      if (ajax.readyState != XMLHttpRequest.DONE) return;
      if (ajax.status != 200) {
        reject(ajax);
        return;
      }
      resolve(JSON.parse(ajax.responseText));
    };

    ajax.open('GET', url, true);
    ajax.send();
  });
}

function find(className, startElem=document) {
  let elems = startElem.getElementsByTagName('*');
  let hasClassName = [];
  for (let i = 0; i < elems.length; i++) {
    if (' ' + elems[i].className + ' '.indexOf(' ' + className + ' ') > -1) {
      hasClassName.push(elems[i]);
    }
  }
  return hasClassName;
}

var news_el = document.getElementById('btn_news');
news_el.addEventListener('click', function(e) {
  console.log(this, e);

  var url = this.getAttribute('data-url');
  console.log(url);

  get(url).then(function(data) {
    console.log(data);
    var resp_elems = find('api-response');
    console.log(resp_elems);

  }).catch(function(err) {
    throw new Error(err);
  });
});
