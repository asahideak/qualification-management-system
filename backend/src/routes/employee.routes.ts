import { Router } from 'express';
import { DefaultEmployeeController } from '../controllers/employee.controller';
// import { DefaultQualificationController } from '../controllers/qualification.controller';  // 一時コメントアウト

const router = Router();
const employeeController = new DefaultEmployeeController();
// const qualificationController = new DefaultQualificationController();  // 一時コメントアウト

// GET /api/employees - 社員一覧取得
router.get('/', (req, res) => employeeController.getAllEmployees(req, res));

// GET /api/employees/company/:companyId - 会社別社員一覧取得
router.get('/company/:companyId', (req, res) => employeeController.getEmployeesByCompanyId(req, res));

// GET /api/employees/:employeeId/qualifications - 社員別資格一覧取得（一時コメントアウト）
// router.get('/:employeeId/qualifications', (req, res) => qualificationController.getQualificationsByEmployeeId(req, res));

// GET /api/employees/:id - 社員詳細取得
router.get('/:id', (req, res) => employeeController.getEmployeeById(req, res));

export default router;