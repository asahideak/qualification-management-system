import { Router } from 'express';
import companyRoutes from './company.routes';
import departmentRoutes from './department.routes';
import employeeRoutes from './employee.routes';
// import qualificationMasterRoutes from './qualificationMaster.routes';  // 一時コメントアウト
// import qualificationRoutes from './qualification.routes';  // 一時コメントアウト
import simpleQualificationRoutes from './simple-qualification.routes';  // 簡易版
import logger from '../lib/logger';

const router = Router();

// ヘルスチェックエンドポイント
router.get('/health', (req, res) => {
  logger.info('ヘルスチェック実行');
  res.status(200).json({
    success: true,
    message: 'API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// マスターデータ基盤エンドポイント
router.use('/companies', companyRoutes);
router.use('/departments', departmentRoutes);
router.use('/employees', employeeRoutes);
// router.use('/qualification-masters', qualificationMasterRoutes);  // 一時コメントアウト

// 資格管理コアエンドポイント（スライス2）
// router.use('/qualifications', qualificationRoutes);  // 一時コメントアウト
router.use('/qualifications', simpleQualificationRoutes);  // 簡易版

// 404ハンドラー
router.use('*', (req, res) => {
  logger.warn('存在しないエンドポイントへのアクセス', {
    path: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message: 'エンドポイントが見つかりません',
    path: req.originalUrl,
  });
});

export default router;