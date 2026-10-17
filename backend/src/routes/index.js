import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { DATA_ROLES } from '../config/constants.js';
import { observationCrud } from '../controllers/observation.controller.js';
import { incidentCrud } from '../controllers/incident.controller.js';
import { patrolCrud } from '../controllers/patrol.controller.js';
import { vegetationCrud } from '../controllers/vegetation.controller.js';
import { datasetCrud, modelCrud } from '../controllers/dataset.controller.js';
import { buildCrudRouter } from './crudRouter.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import alertRoutes from './alert.routes.js';
import reportRoutes from './report.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
router.use('/auth', authRoutes);

// Everything below requires a signed-in user
router.use(protect);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/observations', buildCrudRouter(observationCrud));
router.use('/incidents', buildCrudRouter(incidentCrud));
router.use('/patrols', buildCrudRouter(patrolCrud));
router.use('/vegetation', buildCrudRouter(vegetationCrud));
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);
router.use('/datasets', buildCrudRouter(datasetCrud, { writeRoles: DATA_ROLES, deleteRoles: DATA_ROLES }));
router.use('/models', buildCrudRouter(modelCrud, { writeRoles: DATA_ROLES, deleteRoles: DATA_ROLES }));

export default router;
