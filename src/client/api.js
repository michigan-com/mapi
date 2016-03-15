'use strict';

document.addEventListener('DOMContentLoaded', function(ev) {
  domReady(ev);
});

function domReady() {
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

  var requestEls = find('api-request');
  for (let i = 0; i < requestEls.length; i++) {
    let req = requestEls[i];
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

      let bodyEl = parents('api-body', this, true);
      let apiEl = find('api-response', bodyEl, true);

      let options = getOptions(find('api-input', bodyEl));
      let queryParams = getOptions(find('api-input-query-param', bodyEl))

      let endpointEl = parents('api-endpoint', this, true);
      let endpointId = endpointEl.getAttribute('id');
      if (endpointId in urlFn) url = urlFn[endpointId](url, options);

      if (options.id) url += `${options.id}/`;

      let urlParams = [];
      for (let param in queryParams) {
        urlParams.push(`${param}=${queryParams[param]}`);
      }

      if (options.limit) urlParams.push(`limit=${options.limit}`);

      if (urlParams.length) {
        url += `?${urlParams.join('&')}`;
      }

      get(url).then(function(response) {
        apiResponse(apiEl, response);
      }).catch(function(response) {
        apiResponse(apiEl, response);
      });
    });
  }
}

function apiResponse(apiEl, response) {
  apiEl.style.display = 'block';

  apiEl.innerHTML = `Request URL: ${response.responseURL}\n`;
  apiEl.innerHTML += `Status: ${response.status} ${response.statusText}\n`;
  let json = JSON.parse(response.responseText);
  apiEl.innerHTML += JSON.stringify(json, null, 2);
}

/**
 * Helper functions
 */

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

function find(className, startElem=document, onlyOne=false) {
  let elems = startElem.getElementsByTagName('*');
  let hasClassName = [];
  for (let i = 0; i < elems.length; i++) {
    if (hasClass(className, elems[i])) {
      if (onlyOne) return elems[i];
      hasClassName.push(elems[i]);
    }
  }
  return hasClassName;
}

function hasClass(className, elem) {
  var classes = ' ' + elem.className + ' ';
  return classes.indexOf(' ' + className + ' ') > -1;
}

function getOptions(optEls) {
  let options = {};
  for (let i = 0; i < optEls.length; i++) {
    let option = optEls[i];
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

function parents(className, startElem=document, onlyOne=false) {
  var parent = startElem.parentNode;
  var elems = [];
  while (parent) {
    if (hasClass(className, parent)) {
      if (onlyOne) return parent;
      elems.push(parent);
    }
    parent = parent.parentNode;
  }
  return elems;
}

