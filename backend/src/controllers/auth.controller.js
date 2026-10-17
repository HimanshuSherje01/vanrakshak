import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (user) => jwt.sign({ sub: user._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new ApiError(400, 'Email and password are required');
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !user.isActive || !(await user.matchesPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  res.json({ token: signToken(user), user });
});

export const me = asyncHandler(async (req, res) => res.json(req.user));

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, designation, range } = req.body || {};
  if (name !== undefined) req.user.name = name;
  if (designation !== undefined) req.user.designation = designation;
  if (range !== undefined) req.user.range = range;
  await req.user.save();
  res.json(req.user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    throw new ApiError(400, 'Current and new password are required');
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchesPassword(currentPassword))) throw new ApiError(400, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});

export const DEMO_ACCOUNTS = [
  {
    email: env.seedAdmin.email.toLowerCase().trim(),
    name: env.seedAdmin.name,
    role: 'admin',
    designation: 'Forest Officer',
    range: 'Tadoba Andhari Tiger Reserve',
  },
  {
    email: 'officer@tadoba.local',
    name: 'Field Officer (Sample)',
    role: 'forest_officer',
    designation: 'Sub-Divisional Forest Officer',
    range: 'Core Zone',
  },
  {
    email: 'ranger@tadoba.local',
    name: 'Range Officer (Sample)',
    role: 'ranger',
    designation: 'Range Forest Officer',
    range: 'Moharli Range',
  },
  {
    email: 'analyst@tadoba.local',
    name: 'Analyst (Sample)',
    role: 'analyst',
    designation: 'GIS Analyst',
    range: 'Tadoba TR',
  },
];

export const getDemoUsers = asyncHandler(async (_req, res) => {
  if (!env.demoMode) {
    throw new ApiError(403, 'Demo mode is disabled in this environment');
  }

  // Ensure standard demo accounts exist in local database
  for (const acct of DEMO_ACCOUNTS) {
    const exists = await User.findOne({ email: acct.email });
    if (!exists) {
      await User.create({
        name: acct.name,
        email: acct.email,
        password: env.seedAdmin.password,
        role: acct.role,
        designation: acct.designation,
        range: acct.range,
        isActive: true,
      });
    }
  }

  const allowedEmails = DEMO_ACCOUNTS.map((a) => a.email);
  const users = await User.find({ email: { $in: allowedEmails }, isActive: true })
    .select('_id name email role designation range');

  const roleOrder = ['admin', 'forest_officer', 'ranger', 'analyst'];
  users.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));

  res.json({ enabled: true, items: users });
});

export const demoLogin = asyncHandler(async (req, res) => {
  if (!env.demoMode) {
    throw new ApiError(403, 'Demo mode is disabled in this environment');
  }

  const { email, role } = req.body || {};
  const allowedEmails = DEMO_ACCOUNTS.map((a) => a.email);

  let targetEmail = null;
  if (email && typeof email === 'string') {
    const clean = email.toLowerCase().trim();
    if (!allowedEmails.includes(clean)) {
      throw new ApiError(403, 'Selected account is not an authorized demo account');
    }
    targetEmail = clean;
  } else if (role && typeof role === 'string') {
    const matched = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!matched) {
      throw new ApiError(400, `Unknown demo role: ${role}`);
    }
    targetEmail = matched.email;
  } else {
    targetEmail = env.seedAdmin.email.toLowerCase().trim();
  }

  let user = await User.findOne({ email: targetEmail });
  if (!user) {
    const template = DEMO_ACCOUNTS.find((a) => a.email === targetEmail);
    if (template) {
      user = await User.create({
        name: template.name,
        email: template.email,
        password: env.seedAdmin.password,
        role: template.role,
        designation: template.designation,
        range: template.range,
        isActive: true,
      });
    }
  }

  if (!user || !user.isActive) {
    throw new ApiError(404, 'Demo account is inactive or not found');
  }

  const token = signToken(user);
  res.json({ token, user, isDemo: true });
});

