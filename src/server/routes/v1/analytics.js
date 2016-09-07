'use strict';

import * as db from '../../db';

const COMPOUND_KEYS = {
  domloadtime: ['avg', 'median'],
  engtm: ['avg', 'median'],
  pfeng: ['d', 'm', 't'],
  pf: ['d', 'm', 't'],
};

export const DEFAULT_ANALYTICS_QUERY_PARAMS = {
  days: 14,
  domains: null,
  limit: null,
  keys: null,
  sort: '',
  today: 0, // treating this like a boolean
};

const identity = (v) => (v);

// function formatReferrers(v) {
//   let map = {};
//   let dd = v.d, cc = v.c, len = dd.length;
//   for (let i = 0; i < len; i++) {
//     map[dd[i]] = cc[i];
//   }
//   return [map];
// }

function mergeReferrers(snapshots) {
  console.log('mergeReferrers = %s', JSON.stringify(mergeReferrers));
  const domains = {};
  snapshots.forEach((snapshot) => {
    snapshot.d.forEach((d) => {
      domains[d] = true;
    });
  });

  const map = {};
  Object.keys(domains).forEach((d) => {
    if (domains.hasOwnProperty(d)) {
      map[d] = [];
    }
  });

  const times = [];
  snapshots.forEach((snapshot) => {
    const snapvalues = {};
    const dd = snapshot.d;
    const cc = snapshot.c;
    const len = dd.length;
    for (let i = 0; i < len; i++) {
      snapvalues[dd[i]] = cc[i];
    }

    Object.keys(domains).forEach((d) => {
      map[d].push(snapvalues[d] || 0);
    });

    times.push(~~(+snapshot.tm / 1000));
  });
  return { tms: times, vs: map };
}

function makeJSONError(code, message) {
  const err = new Error(message);
  err.status = code;
  err.type = 'json';
  return err;
}

function expandKeys(keys) {
  const expanded = [];
  keys.forEach((key) => {
    if (COMPOUND_KEYS.hasOwnProperty(key)) {
      COMPOUND_KEYS[key].forEach((subkey) => {
        expanded.push(`${key}.${subkey}`);
      });
    } else {
      expanded.push(key);
    }
  });
  return expanded;
}

function mapHistoricalValuesToCompactForm(rows, compactor) {
  const values = [];
  rows.forEach((row) => {
    row.values.forEach((v) => {
      const newv = compactor(v);
      values.push(newv);
    });
  });

  return values;
}

function formatTotals(rows, funcs) {
  const values = [];
  rows.forEach((v) => {
    const newv = funcs.map((f) => f(v));
    values.push(newv);
  });

  return values;
}

function formatUsing(funcs, obj) {
  return funcs.map((f) => f(obj));
}

function formatValue(v) {
  if (v instanceof Date) {
    return ~~(+v / 1000);
  }
  return v;
}

function makeGetter(key) {
  const idx = key.indexOf('.');
  if (idx < 0) {
    return (obj) => {
      if (!obj.hasOwnProperty(key)) {
        return null;
      }
      return formatValue(obj[key]);
    };
  }
  const first = key.substr(0, idx);
  const second = key.substr(idx + 1);

  return (obj) => {
    if (!obj.hasOwnProperty(first)) {
      return null;
    }
    const subobj = obj[first];
    if (typeof subobj !== 'object' || subobj === null) {
      return null;
    }
    if (!subobj.hasOwnProperty(second)) {
      return null;
    }
    return formatValue(subobj[second]);
  };
}

class HistoricalValueQuery {
  constructor(model, key, compactor = null, merger = identity) {
    this.model = model;
    this.key = key;
    this.compactor = compactor;
    this.merger = merger;

    this.expressRoute = this.expressRoute.bind(this);
  }

  async expressRoute(req, res, next) {
    try {
      const response = await this.getHistoricalValues(req.query);
      return res.json(response);
    } catch (e) {
      return next(makeJSONError(400, e));
    }
  }

  /**
   * Get historical values for a given model. Will return
   */
  async getHistoricalValues(reqParams) {
    const query = { ...DEFAULT_ANALYTICS_QUERY_PARAMS, ...reqParams };

    let compactorInEffect = this.compactor;

    const days = query.days;

    let fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    if (query.today === '1') {
      fromDate = new Date();
      fromDate.setHours(0); fromDate.setMinutes(0); fromDate.setSeconds(0);
    }

    const criteria = { tmstart: { $gte: fromDate } };
    if (query.domains != null) {
      const domains = (`${query.domains}`).trim().split(/\s*,\s*/);
      if (domains.length === 1) {
        criteria.domain = domains[0];
      } else {
        criteria.domain = { $in: domains };
      }
    }

    let limit = 1000;
    if (query.limit != null) {
      const v = ~~query.limit;
      if (v !== 0) {
        limit = v;
      }
    }

    let keys;
    if (!compactorInEffect) {
      if (query.keys == null) {
        throw new Error('"keys" parameter is required');
      } else if (query.keys === 'raw') {
        compactorInEffect = identity;
        keys = null;
      } else {
        keys = (`${query.keys}`).split(',').filter((s) => s.length > 0 && s.match(/^[\w.]+$/));
        keys = ['tm'].concat(keys);
      }
    }

    let sort = null;
    if (query.sort != null && query.sort !== '') {
      let f = query.sort;
      let o = -1;
      if (f[0] === '+') {
        o = 1;
        f = f.substr(1);
      }
      sort = {};
      sort[`last.${f}`] = o;
    }

    let q = this.model.find(criteria);
    // if (select) {
    //   q = q.select(select)
    // }
    if (sort) {
      q = q.sort(sort);
    }
    if (limit) {
      q = q.limit(limit);
    }
    let rows = await q.exec();
    if (!rows) {
      throw new Error(`Could not find rows from date ${fromDate}`);
    }
    rows = rows.map((row) => row.toObject());

    rows.sort((a, b) => {
      if (a.tmstart < b.tmstart) return -1;
      else if (a.tmstart > b.tmstart) return 1;

      return 0;
    });

    const rowsByKey = {};
    rows.forEach((row) => {
      const k = row[this.key]
      ;(rowsByKey[k] || (rowsByKey[k] = [])).push(row);
    });

    const results = {};
    const response = {};
    response[this.key] = results;
    console.log('keys = %s', JSON.stringify(keys));
    if (keys) {
      keys = expandKeys(keys);
      response.keys = keys;
      compactorInEffect = formatUsing.bind(null, keys.map(makeGetter));
    }

    Object.keys(rowsByKey).forEach((k) => {
      const values = this.merger(mapHistoricalValuesToCompactForm(rowsByKey[k], compactorInEffect));
      results[k] = values;
    });
    return response;
  }
}

class TotalsQuery {
  constructor(model, key) {
    this.model = model;
    this.key = key;

    this.expressRoute = this.expressRoute.bind(this);
  }

  async expressRoute(req, res, next) {
    try {
      const response = await this.getTotalValues(req.query);
      return res.json(response);
    } catch (e) {
      return next(makeJSONError(400, e));
    }
  }

  async getTotalValues(reqParams) {
    const query = { ...DEFAULT_ANALYTICS_QUERY_PARAMS, ...reqParams };

    const days = query.days || 14;
    let fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    if (query.today === '1') {
      fromDate = new Date();
      fromDate.setHours(0); fromDate.setMinutes(0); fromDate.setSeconds(0);
    }

    const criteria = { tmstart: { $gte: fromDate } };
    if (query.domains != null) {
      const domains = (`${query.domains}`).trim().split(/\s*,\s*/);
      if (domains.length === 1) {
        criteria.domain = domains[0];
      } else {
        criteria.domain = { $in: domains };
      }
    }

    let limit = 1000;
    if (query.limit != null) {
      const v = ~~query.limit;
      if (v !== 0) {
        limit = v;
      }
    }

    let keys;
    if (query.keys == null) {
      throw new Error('"keys" parameter is required');
    } else if (query.keys === 'raw') {
      // NOOP
    } else {
      keys = (`${query.keys}`).split(',').filter((s) => s.length > 0 && /^[\w.]+$/.test(s));
      keys = ['period', 'tmstart'].concat(keys);
    }

    let sort = null;
    if (query.sort != null && query.sort !== '') {
      let f = query.sort;
      let o = -1;
      if (f[0] === '+') {
        o = 1;
        f = f.substr(1);
      }
      sort = {};
      sort[f] = o;
    }

    let q = this.model.find(criteria);
    // if (select) {
    //   q = q.select(select)
    // }
    if (sort) {
      q = q.sort(sort);
    }
    if (limit) {
      q = q.limit(limit);
    }
    let rows = await q.exec();
    if (!rows) {
      throw new Error(`Could not find rows from date ${fromDate}`);
    }
    rows = rows.map((row) => row.toObject());

    rows.sort((a, b) => {
      if (a.tmstart < b.tmstart) return -1;
      else if (a.tmstart > b.tmstart) return 1;
      return 0;
    });

    const rowsByKey = {};
    rows.forEach((row) => {
      const k = row[this.key]
      ;(rowsByKey[k] || (rowsByKey[k] = [])).push(row);
    });

    const results = {};
    const response = {};
    response[this.key] = results;
    let funcs;
    if (keys) {
      keys = expandKeys(keys);
      response.keys = keys;
      funcs = keys.map(makeGetter);
    }
    Object.keys(rowsByKey).forEach((k) => {
      const rowsByKeyRow = rowsByKey[k];
      const values = (funcs ? formatTotals(rowsByKeyRow, funcs) : rowsByKeyRow);
      results[k] = values;
    });

    return response;
  }
}

// function get(key, obj) {
//   console.log('getting key %j of %j', key, obj)
//   let idx = key.indexOf('.')
//   if (idx < 0) {
//     if (!obj.hasOwnProperty(key)) {
//       return null
//     }
//     return obj[key]
//   } else {
//     let first = key.substr(0, idx)
//     if (!obj.hasOwnProperty(first)) {
//       return null
//     }
//     obj = obj[first]

//     key = key.substr(idx + 1)
//   }
// }

export const loadDomainStats = new HistoricalValueQuery(db.DomainDaily, 'domain');
export const loadArticleStats = new HistoricalValueQuery(db.ArticleDaily, 'aid');
export const loadAuthorStats = new HistoricalValueQuery(db.AuthorDaily, 'author');
export const loadReferrers = new HistoricalValueQuery(db.ReferrersDaily, 'domain',
                                                    identity, mergeReferrers);

export const loadDomainTotals = new TotalsQuery(db.DomainTotals, 'domain');
export const loadArticleTotals = new TotalsQuery(db.ArticleTotals, 'aid');
export const loadAuthorTotals = new TotalsQuery(db.AuthorTotals, 'author');
