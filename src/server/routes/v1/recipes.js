import * as db from '../../db';
let debug = require('debug')('app:recipes');

export async function index(req, res, next) {
  let DEFAULT_LIMIT = 100;
  let limit = 'limit' in req.query ? req.query.limit : DEFAULT_LIMIT;

  let mongoFilter = {};

  addMarkFilter(mongoFilter, 'flagged', req.query.flagged);
  addMarkFilter(mongoFilter, 'verified', req.query.verified);

  try {
    let query = db.recipes.find(mongoFilter).sort({ _id: -1 });
    if (limit > 0) {
      query.limit(limit);
    }
    let items = await query.toArray();
    res.json({ recipes: items });
  } catch(err) {
    var err = new Error(err);
    err.status = 500;
    err.type = 'json';
    return next(err);
  }
}

export async function mark(req, res, next) {
  let recipeId = req.params.recipeId;

  let mark = sanitizeMark(req.params.mark);
  let value = sanitizeMarkValue((req.body && typeof(req.body.value) !== 'undefined') ? req.body.value : 1);

  let filter = { _id: db.ObjectId(recipeId) };
  let changes = { $set: { [mark]: value } };

  debug('mark: %j', { recipeId, mark, value, filter, changes, body: req.body, bodyType: typeof(req.body) });

  let result = await db.recipes.updateOne(filter, changes, { safe: db.safe });
  db.verifyUpdateResult(result, 'Recipe not found', 'Recipe update failed');
  res.json({ value: value });
}

function addMarkFilter(filter, mark, param) {
  if (typeof(param) === 'string') {
    let isSet = !(param === '0');
    filter[mark] = (isSet ? 1 : {'$in': [0, null]});
  }
}

function sanitizeMark(mark) {
  if (!(mark === 'flagged' || mark == 'verified')) {
    let err = new Error('Invalid mark');
    err.status = 422;
    err.type = 'json';
    throw err;
  }
  return mark;
}

function sanitizeMarkValue(value) {
  console.log('sanitizeMarkValue %j', value);
  if (!(value === 0 || value === 1)) {
    var err = new Error('Invalid mark value');
    err.status = 500;
    err.type = 'json';
    throw err;
  }
  return value;
}
