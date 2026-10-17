import { restrictTo } from '../middleware/auth.js';
import { WRITE_ROLES } from '../config/constants.js';
import { alertCrud, reviewAlert } from '../controllers/alert.controller.js';
import { buildCrudRouter } from './crudRouter.js';

export default buildCrudRouter(alertCrud, {
  extend: (router) => router.patch('/:id/review', restrictTo(...WRITE_ROLES), reviewAlert),
});
