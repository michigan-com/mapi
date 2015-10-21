import { mdb, ObjectId } from '../../db';
let debug = require('debug')('app:recipes');

export async function index(req, res, next) {
  let DEFAULT_LIMIT = 100;
  let limit = 'limit' in req.query ? req.query.limit : DEFAULT_LIMIT;

  let mongoFilter = {};

  try {
    let query = mdb.recipes.find(mongoFilter).sort({ _id: -1 });
    if (limit > 0) {
      query.limit(limit);
    }
    let items = await query.toArray();
    console.error('items = %s', require('util').inspect(items));
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
  let value = 1;

  let filter = { _id: ObjectId(recipeId) };
  let changes = { $set: { [mark]: value } };

  debug('mark: %j', { recipeId, mark, value, filter, changes });

  let result = await mdb.recipes.updateOne(filter, changes, { safe: 'majority' });
  res.json({ result: result, value: value });

  // try {
  //   let result = await Recipe.update(filter, changes).exec();
  //   res.json({ result: result, value: value });
  // } catch(err) {
  //   var err = new Error(err);
  //   err.status = 500;
  //   err.type = 'json';
  //   return next(err);
  // }
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
