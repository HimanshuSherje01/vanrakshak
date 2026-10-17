import { Router } from 'express';
import { getSummary, getMapLayers, getTigerGeoJson } from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/summary', getSummary);
router.get('/map-layers', getMapLayers);
router.get('/tiger-geojson', getTigerGeoJson);

export default router;
