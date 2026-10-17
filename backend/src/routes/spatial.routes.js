import { Router } from 'express';
import { getSpatialData, getSpatialSummary } from '../controllers/spatial.controller.js';

const router = Router();

router.get('/', getSpatialData);
router.get('/summary', getSpatialSummary);

export default router;
