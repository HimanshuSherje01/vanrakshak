import { Router } from 'express';
import { restrictTo } from '../middleware/auth.js';
import { WRITE_ROLES, DELETE_ROLES } from '../config/constants.js';

/** Standard REST router: GET / , GET /:id , POST / , PATCH /:id , DELETE /:id */
export function buildCrudRouter(crud, { writeRoles = WRITE_ROLES, deleteRoles = DELETE_ROLES, extend } = {}) {
  const router = Router();
  if (extend) extend(router); // custom routes must be registered before '/:id'
  router.get('/', crud.list);
  router.post('/', restrictTo(...writeRoles), crud.create);
  router.get('/:id', crud.getOne);
  router.patch('/:id', restrictTo(...writeRoles), crud.update);
  router.delete('/:id', restrictTo(...deleteRoles), crud.remove);
  return router;
}
