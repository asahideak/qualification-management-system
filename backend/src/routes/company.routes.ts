import { Router } from 'express';
import { DefaultCompanyController } from '../controllers/company.controller';

const router = Router();
const companyController = new DefaultCompanyController();

// GET /api/companies - 会社一覧取得
router.get('/', (req, res) => companyController.getAllCompanies(req, res));

// GET /api/companies/:id - 会社詳細取得
router.get('/:id', (req, res) => companyController.getCompanyById(req, res));

export default router;