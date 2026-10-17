import { User } from '../models/User.js';
import { createCrud } from '../utils/crudFactory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const crud = createCrud(User, { searchFields: ['name', 'email'], filterFields: ['role'], defaultSort: 'name' });

export const listUsers = crud.list;

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, designation, range } = req.body || {};
  const user = await User.create({ name, email, password, role, designation, range });
  res.status(201).json(user);
});

export const setUserActive = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) throw new ApiError(400, 'You cannot disable your own account');
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = Boolean(req.body?.isActive);
  await user.save();
  res.json(user);
});
