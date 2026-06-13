import express from 'express';
import { getVisitorCount, trackVisit } from '../controllers/visitorController.js';

const router = express.Router();

router.get('/', getVisitorCount);
router.post('/track', trackVisit);

export default router;
