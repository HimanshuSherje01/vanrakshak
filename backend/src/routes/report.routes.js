import { restrictTo } from '../middleware/auth.js';
import { WRITE_ROLES } from '../config/constants.js';
import { reportCrud, generateReport } from '../controllers/report.controller.js';
import { buildCrudRouter } from './crudRouter.js';

export default buildCrudRouter(reportCrud, {
  extend: (router) => router.post('/generate', restrictTo(...WRITE_ROLES), generateReport),
});
