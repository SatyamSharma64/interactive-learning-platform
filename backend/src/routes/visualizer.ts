import express from 'express';
import { CodeTracingService } from '../services/codeTracingService.js';

const router = express.Router();
const tracingService = new CodeTracingService();

router.post('/trace', async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ 
        error: 'Code and language are required' 
      });
    }

    const steps = await tracingService.generateExecutionTrace({
      code,
      language,
      input,
    });

    res.json({ steps });
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

export default router;