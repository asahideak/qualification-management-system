import { Router } from 'express';
import { DefaultDepartmentController } from '../controllers/department.controller';

const router = Router();
const departmentController = new DefaultDepartmentController();

// GET /api/departments - 部署一覧取得
router.get('/', (req, res) => departmentController.getAllDepartments(req, res));

// GET /api/departments/company/:companyId - 会社別部署一覧取得
router.get('/company/:companyId', (req, res) => departmentController.getDepartmentsByCompanyId(req, res));

// GET /api/departments/:id - 部署詳細取得
router.get('/:id', (req, res) => departmentController.getDepartmentById(req, res));

export default router;