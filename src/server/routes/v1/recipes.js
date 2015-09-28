import { Recipe } from '../../db';

export async function index(req, res, next) {
  let DEFAULT_LIMIT = 100;
  let limit = 'limit' in req.query ? req.query.limit : DEFAULT_LIMIT;

  let mongoFilter = {};

  try {
    let query = Recipe.find(mongoFilter).sort({ _id: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    let items = await query.exec();
    res.json({ recipes: items });
  } catch(err) {
    var err = new Error(err);
    err.status = 500;
    err.type = 'json';
    return next(err);
  }
}
