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
      resolve(ajax);
    };

    ajax.open('GET', url, true);
    ajax.send();
  });
}

function find(className, startElem=document, how_many=0) {
  let elems = startElem.getElementsByTagName('*');
  let hasClassName = [];
  for (let i = 0; i < elems.length; i++) {
    if (hasClass(className, elems[i])) {
      hasClassName.push(elems[i]);
      if (how_many > 0 && hasClassName.length == how_many) {
        return hasClassName;
      }
    }
  }
  return hasClassName;
}

function hasClass(className, elem) {
  var classes = ' ' + elem.className + ' ';
  return classes.indexOf(' ' + className + ' ') > -1;
}

function findOne(className, startElem=document) {
  var elems = find(className, startElem, 1);
  if (elems.length > 0) {
    return elems[0];
  }
}

function getOptions(opt_els) {
  let options = {};
  for (let i = 0; i < opt_els.length; i++) {
    let option = opt_els[i];
    let key = option.name;
    let value = option.value;
    if (key in options) {
      console.log(`Key ${key} already found, this shouldn't happen ...`);
      continue;
    }

    options[key] = value;
  }
  return options;
}

function parents(className, startElem=document, only_one=true) {
  var parent = startElem.parentNode;
  var elems = [];
  while (parent) {
    if (hasClass(className, parent)) {
      if (only_one) return parent;
      elems.push(parent);
    }
    parent = parent.parentNode;
  }
  return elems;
}

// any endpoint ID listed here will be able to manipulate their URL
// before it gets requested
var urlFn = {
  v1_news_site: function(url, options) {
    if (options.site) url += options.site + '/';
    return url;
  }
};

var request_els = find('api-request');
for (let i = 0; i < request_els.length; i++) {
  let req = request_els[i];
  req.addEventListener('click', function(ev) {
    let body = findOne('api-body', this.parentNode);
    if (body.style.display == "none" || !body.style.display) {
      body.style.display = "block";
    } else {
      body.style.display = "none";
    }
  });
}

var buttons = find('btn');
for (let i = 0; i < buttons.length; i++) {
  let button = buttons[i];
  button.addEventListener('click', function(ev) {
    let url = this.getAttribute('data-url');
    let body_el = parents('api-body', this);
    let options = find('api-input', body_el);
    options = getOptions(options);

    let endpoint_el = parents('api-endpoint', this);
    let endpoint_id = endpoint_el.getAttribute('id');
    if (endpoint_id in urlFn) {
      url = urlFn[endpoint_id](url, options);
    }

    get(url).then(response => {
      let api_resp = findOne('api-response', body_el);
      api_resp.style.display = 'block';

      api_resp.innerHTML = `Request URL: ${response.responseURL}\n`;
      api_resp.innerHTML += `Status: ${response.status} ${response.statusText}\n`;
      let json = JSON.parse(response.responseText);
      api_resp.innerHTML += JSON.stringify(json, null, 2);
    }).catch(function(response) {
      throw new Error(response.status);
    });
  });
}

/*document.addEventListener('DOMContentLoaded', function(ev) {});*/

