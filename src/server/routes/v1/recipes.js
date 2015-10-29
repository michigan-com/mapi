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

    let fmt = req.params.format || req.accepts('json', 'html');
    if (fmt === "html") {
      let ordinal = 1
      items.forEach((recipe) => {
        recipe.ordinal = ordinal++;
        recipe.lines = recipeToText(recipe);

        let photo = recipe.photo && (recipe.photo.full || recipe.photo.small);
        recipe.photoUrl = (photo && photo.url);
      })
      res.render('recipes', { recipes: items, total: items.length });
    } else if (fmt === "json") {
      res.json({ recipes: items });
    } else {
      res.status(406).end();
    }
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
  if (!(value === 0 || value === 1)) {
    var err = new Error('Invalid mark value');
    err.status = 500;
    err.type = 'json';
    throw err;
  }
  return value;
}

function recipeToText(recipe) {
  let tags = [];
  if (recipe.flagged) {
    tags.push("#flagged")
  }
  if (recipe.verified) {
    tags.push("#verified")
  }

  let claims = [];
  if (recipe.serving_size) {
    claims.push(`Serving size: ${recipe.serving_size}.`)
  }
  if (recipe.prep_time) {
    claims.push(`Preparation time: ${recipe.prep_time.text}.`)
  }
  if (recipe.total_time) {
    claims.push(`Total time: ${recipe.total_time.text}.`)
  }

  let lines = []

  if (tags.length > 0) {
    lines.push(tags.join(" "));
  }
  if (claims.length > 0) {
    lines.push(claims.join(" "));
  }

  lines.push("INGREDIENTS:");
  for (let item of recipe.ingredients || []) {
    lines.push(`• ${item.text}`)
    
  }

  lines.push("DIRECTIONS:");
  for (let item of recipe.instructions || []) {
    lines.push(`${item.text}`)
  }

  if (recipe.nutrition) {
    lines.push(`NUTRICION: ${recipe.nutrition.text}`)
  }

  return lines
}
