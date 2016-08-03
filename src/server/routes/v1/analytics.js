import * as db from '../../db'
let debug = require('debug')('app:')

export var loadDomainStats = loadHistoricalValues(db.DomainDaily, 'domain')
export var loadArticleStats = loadHistoricalValues(db.ArticleDaily, 'aid')
export var loadAuthorStats = loadHistoricalValues(db.AuthorDaily, 'author')
export var loadReferrers = loadHistoricalValues(db.ReferrersDaily, 'domain', identity, mergeReferrers)

export var loadDomainTotals = loadTotals(db.DomainTotals, 'domain')
export var loadArticleTotals = loadTotals(db.ArticleTotals, 'aid')
export var loadAuthorTotals = loadTotals(db.AuthorTotals, 'author')

const COMPOUND_KEYS = {
  'domloadtime': ['avg', 'median'],
  'engtm': ['avg', 'median'],
  'pfeng': ['d', 'm', 't'],
  'pf': ['d', 'm', 't'],
}

function identity(v) {
  return v
}

function formatReferrers(v) {
  let map = {}
  let dd = v.d, cc = v.c, len = dd.length
  for (let i = 0; i < len; i++) {
    map[dd[i]] = cc[i]
  }
  return [map]
}

function mergeReferrers(snapshots) {
  console.log('mergeReferrers = %s', JSON.stringify(mergeReferrers))
  let domains = {}
  snapshots.forEach((snapshot) => {
    snapshot.d.forEach((d) => {
      domains[d] = true
    })
  })

  let map = {}
  for (let d in domains) if (domains.hasOwnProperty(d)) {
    map[d] = []
  }

  let times = []

  snapshots.forEach((snapshot) => {
    let snapvalues = {}, dd = snapshot.d, cc = snapshot.c, len = dd.length
    for (let i = 0; i < len; i++) {
      snapvalues[dd[i]] = cc[i]
    }

    for (let d in domains) if (domains.hasOwnProperty(d)) {
      map[d].push(snapvalues[d] || 0)
    }

    times.push(~~(+snapshot.tm/1000))
  })
  return {tms: times, vs: map}
}

function loadHistoricalValues(model, key, compactor=null, merger=identity) {
  return async function(req, res, next) {
    let compactorInEffect = compactor

    let days = req.query.days || 14
    let fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    let criteria = { 'tmstart': { '$gte': fromDate }}
    if (req.query.domains != null) {
      let domains = ('' + req.query.domains).trim().split(/\s*,\s*/)
      if (domains.length === 1) {
        criteria['domain'] = domains[0]
      } else {
        criteria['domain'] = {'$in': domains}
      }
    }

    let limit = 1000
    if (req.query.limit != null) {
      let v = ~~req.query.limit
      if (v != 0) {
        limit = v
      }
    }

    var keys
    if (!compactorInEffect) {
      if (req.query.keys == null) {
        return next(makeJSONError(400, '"keys" parameter is required'))
      } else if (req.query.keys === 'raw') {
        compactorInEffect = identity
        keys = null
      } else {
        keys = ('' + req.query.keys).split(',').filter((s) => s.length > 0 && s.match(/^[\w.]+$/))
        keys = ['tm'].concat(keys)
      }
    }

    let sort = null
    if (req.query.sort != null && req.query.sort != '') {
      let f = req.query.sort
      let o = -1
      if (f[0] == '+') {
        o = 1
        f = f.substr(1)
      }
      sort = {}
      sort['last.' + f] = o
    }

    let q = model.find(criteria)
    // if (select) {
    //   q = q.select(select)
    // }
    if (sort) {
      q = q.sort(sort)
    }
    if (limit) {
      q = q.limit(limit)
    }
    let rows = await q.exec()
    if (!rows) {
      return next(makeJSONError(404, `Could not find rows from date ${fromDate}`))
    }
    rows = rows.map((row) => row.toObject())

    rows.sort((a, b) => {
      if (a.tmstart < b.tmstart)
        return -1
      else if (a.tmstart > b.tmstart)
        return 1
      else
        return 0
    })

    let rowsByKey = {}
    rows.forEach((row) => {
      let k = row[key]
      ;(rowsByKey[k] || (rowsByKey[k] = [])).push(row)
    });
  
    let results = {}
    let response = {}
    response[key] = results
    console.log('keys = %s', JSON.stringify(keys))
    if (keys) {
      keys = expandKeys(keys)
      response.keys = keys
      compactorInEffect = formatUsing.bind(null, keys.map(makeGetter))
    }
    for (let k in rowsByKey) if (rowsByKey.hasOwnProperty(k)) {
      let values = merger(mapHistoricalValuesToCompactForm(rowsByKey[k], compactorInEffect))
      results[k] = values
    }

    res.json(response)
  }
}

function loadTotals(model, key) {
  return async function(req, res, next) {
    let days = req.query.days || 14
    let fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    let criteria = { 'tmstart': { '$gte': fromDate }}
    if (req.query.domains != null) {
      let domains = ('' + req.query.domains).trim().split(/\s*,\s*/)
      if (domains.length === 1) {
        criteria['domain'] = domains[0]
      } else {
        criteria['domain'] = {'$in': domains}
      }
    }

    let limit = 1000
    if (req.query.limit != null) {
      let v = ~~req.query.limit
      if (v != 0) {
        limit = v
      }
    }

    let keys
    if (req.query.keys == null) {
      return next(makeJSONError(400, '"keys" parameter is required'))
    } else if (req.query.keys === 'raw') {
    } else {
      keys = ('' + req.query.keys).split(',').filter((s) => s.length > 0 && /^[\w.]+$/.test(s))
      keys = ['period', 'tmstart'].concat(keys)
    }

    let sort = null
    if (req.query.sort != null && req.query.sort != '') {
      let f = req.query.sort
      let o = -1
      if (f[0] == '+') {
        o = 1
        f = f.substr(1)
      }
      sort = {}
      sort[f] = o
    }

    let q = model.find(criteria)
    // if (select) {
    //   q = q.select(select)
    // }
    if (sort) {
      q = q.sort(sort)
    }
    if (limit) {
      q = q.limit(limit)
    }
    let rows = await q.exec()
    if (!rows) {
      return next(makeJSONError(404, `Could not find rows from date ${fromDate}`))
    }
    rows = rows.map((row) => row.toObject())

    rows.sort((a, b) => {
      if (a.tmstart < b.tmstart)
        return -1
      else if (a.tmstart > b.tmstart)
        return 1
      else
        return 0
    })

    let rowsByKey = {}
    rows.forEach((row) => {
      let k = row[key]
      ;(rowsByKey[k] || (rowsByKey[k] = [])).push(row)
    });

    let results = {}
    let response = {}
    response[key] = results
    let funcs
    if (keys) {
      keys = expandKeys(keys)
      response.keys = keys
      funcs = keys.map(makeGetter)
    }
    for (let k in rowsByKey) if (rowsByKey.hasOwnProperty(k)) {
      let rows = rowsByKey[k]
      let values = (funcs ? formatTotals(rows, funcs) : rows)
      results[k] = values
    }

    res.json(response)
  }
}

function makeJSONError(code, message) {
    let err = new Error(message)
    err.status = code
    err.type = 'json'
    return err
}

function mapHistoricalValuesToCompactForm(rows, compactor) {
  let values = []
  rows.forEach((row) => {
    row.values.forEach((v) => {
      let newv = compactor(v)
      values.push(newv)
    });
  })

  return values  
}

function expandKeys(keys) {
  let expanded = []
  keys.forEach((key) => {
    if (COMPOUND_KEYS.hasOwnProperty(key)) {
      COMPOUND_KEYS[key].forEach((subkey) => {
        expanded.push(key + '.' + subkey)
      })
    } else {
      expanded.push(key)
    }
  })
  return expanded
}

function formatTotals(rows, funcs) {
  let values = []
  rows.forEach((v) => {
    let newv = funcs.map((f) => f(v))
    values.push(newv)
  })

  return values  
}

function formatUsing(funcs, obj) {
  return funcs.map((f) => f(obj))
}

function makeGetter(key) {
  let idx = key.indexOf('.')
  if (idx < 0) {
    return function(obj) {
      if (!obj.hasOwnProperty(key)) {
        return null
      }
      return formatValue(obj[key])
    }
  } else {
    let first = key.substr(0, idx)
    let second = key.substr(idx + 1)

    return function(obj) {
      if (!obj.hasOwnProperty(first)) {
        return null
      }
      let subobj = obj[first]
      if (typeof subobj != 'object' || subobj == null) {
        return null
      }
      if (!subobj.hasOwnProperty(second)) {
        return null
      }
      return formatValue(subobj[second])
    }

  }
}

function formatValue(v) {
  if (v instanceof Date) {
    return ~~(+v/1000)
  } else {
    return v
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
