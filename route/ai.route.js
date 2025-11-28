import express from 'express';
import { generateSuggestions } from '../controllers/ai.controller.js';
const router = express.Router();

router.post('/', generateSuggestions);

export default router;