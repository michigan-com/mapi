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

function find(className, startElem=document, only_one=false) {
  let elems = startElem.getElementsByTagName('*');
  let hasClassName = [];
  for (let i = 0; i < elems.length; i++) {
    if (hasClass(className, elems[i])) {
      if (only_one) {
        return elems[i];
      }
      hasClassName.push(elems[i]);
    }
  }
  return hasClassName;
}

function hasClass(className, elem) {
  var classes = ' ' + elem.className + ' ';
  return classes.indexOf(' ' + className + ' ') > -1;
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

function parents(className, startElem=document, only_one=false) {
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
  },
  v1_news_site_section: function(url, options) {
    if (options.site) url += options.site + '/';
    if (options.section) url += options.section + '/';
    return url;
  }
};

var request_els = find('api-request');
for (let i = 0; i < request_els.length; i++) {
  let req = request_els[i];
  req.addEventListener('click', function(ev) {
    let body = find('api-body', this.parentNode, true);
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
    let body_el = parents('api-body', this, true);
    let options = find('api-input', body_el);
    options = getOptions(options);

    let endpoint_el = parents('api-endpoint', this, true);
    let endpoint_id = endpoint_el.getAttribute('id');
    if (endpoint_id in urlFn) {
      url = urlFn[endpoint_id](url, options);
    }

    if (options.limit) {
      url += `?limit=${options.limit}`;
    }

    get(url).then(response => {
      let api_resp = find('api-response', body_el, true);
      api_resp.style.display = 'block';

      api_resp.innerHTML = `Request URL: ${response.responseURL}\n`;
      api_resp.innerHTML += `Status: ${response.status} ${response.statusText}\n`;
      let json = JSON.parse(response.responseText);
      api_resp.innerHTML += JSON.stringify(json, null, 2);
    }).catch(function(response) {
      let api_resp = find('api-response', body_el, true);
      api_resp.style.display = 'block';

      api_resp.innerHTML = `Request URL: ${response.responseURL}\n`;
      api_resp.innerHTML += `Status: ${response.status} ${response.statusText}\n`;
      let json = JSON.parse(response.responseText);
      api_resp.innerHTML += JSON.stringify(json, null, 2);
    });
  });
}

/*document.addEventListener('DOMContentLoaded', function(ev) {});*/

