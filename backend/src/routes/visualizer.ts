import express from 'express';
import { tracingService } from '../services/codeTracingService.js';
import { prisma } from '../lib/prisma.js';
import { templateService } from '../services/templateManagementService.js';

const router = express.Router();

router.post('/trace', async (req, res) => {
  try {
    const { problemId, code, languageId, input = '' } = req.body;

    if (!code || !languageId) {
      return res.status(400).json({ 
        error: 'Code and language are required' 
      });
    }

    const codeTemplate = await prisma.codeTemplate.findUnique({
      where: { 
        problemId_languageId: { problemId, languageId } 
      },
      include: {
        parameters: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    const language = await prisma.programmingLanguage.findUnique({
      where: { id: languageId },
    });

    const testCases = await prisma.testCase.findMany({
      where: { problemId, isSample: true },
      orderBy: { orderIndex: 'asc' },
    });

    if (!codeTemplate) {
      return res.status(400).json({ code: 'NOT_FOUND', message: 'Code template not found for this problem and language' });
    }

    const fullCode = templateService.buildFullScript(codeTemplate, code);

    const steps = await tracingService.generateExecutionTrace({
      code: fullCode,
      language: language?.name || 'Unknown',
      input,
    });
    console.log('Generated steps:', steps);

    res.json({ steps });
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

export default router;