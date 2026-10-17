import { asyncHandler } from './asyncHandler.js';
import { ApiError } from './ApiError.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isString = (v) => typeof v === 'string' && v.length > 0;
const PROTECTED = ['_id', 'createdAt', 'updatedAt', 'createdBy', '__v'];

const stripProtected = (body = {}) => {
  const clean = { ...body };
  PROTECTED.forEach((k) => delete clean[k]);
  return clean;
};

/**
 * Builds list/get/create/update/remove handlers for a Mongoose model.
 * options: searchFields, filterFields, dateField, defaultSort, populate
 */
export function createCrud(Model, options = {}) {
  const { searchFields = [], filterFields = [], dateField, defaultSort = '-createdAt', populate = '' } = options;

  const list = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const query = {};

    filterFields.forEach((f) => {
      if (isString(req.query[f])) query[f] = req.query[f];
    });
    if (isString(req.query.search) && searchFields.length) {
      const rx = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      query.$or = searchFields.map((f) => ({ [f]: rx }));
    }
    const days = parseInt(req.query.days, 10);
    if (dateField && days > 0) query[dateField] = { $gte: new Date(Date.now() - days * 86400000) };

    const sort = isString(req.query.sort) && /^-?[\w.]+$/.test(req.query.sort) ? req.query.sort : defaultSort;
    let find = Model.find(query).sort(sort).skip((page - 1) * limit).limit(limit);
    if (populate) find = find.populate(populate);
    const [items, total] = await Promise.all([find, Model.countDocuments(query)]);
    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  });

  const getOne = asyncHandler(async (req, res) => {
    let find = Model.findById(req.params.id);
    if (populate) find = find.populate(populate);
    const doc = await find;
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json(doc);
  });

  const create = asyncHandler(async (req, res) => {
    const body = stripProtected(req.body);
    if (Model.schema.path('createdBy')) body.createdBy = req.user._id;
    const doc = await Model.create(body);
    res.status(201).json(doc);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    doc.set(stripProtected(req.body));
    await doc.save();
    res.json(doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ message: `${Model.modelName} deleted` });
  });

  return { list, getOne, create, update, remove };
}
