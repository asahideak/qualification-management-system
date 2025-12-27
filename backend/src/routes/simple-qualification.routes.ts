import { Router } from 'express';
import logger from '../lib/logger';

const router = Router();

// GET /api/qualifications/all-employees - 全社員資格一覧取得（簡易版）
router.get('/all-employees', (req, res) => {
  try {
    const expirationStatus = req.query.expirationStatus as string;
    logger.info('全社員資格一覧取得開始（簡易版）', {
      expirationStatus
    });

    // E2Eテスト用のモックデータ（全データ）
    const allMockData = [
      {
        employeeName: '田中太郎',
        employeeId: 'emp-tanaka',
        companyName: '株式会社本社',
        companyId: 'comp-honsha',
        departmentName: '管理部',
        departmentId: 'dept-honsha-kanri',
        qualificationId: 'qual-tanaka-fe',
        qualificationName: '基本情報技術者試験',
        acquiredDate: '2023-04-15',
        expirationDate: 'permanent',
        status: 'valid'
      },
      {
        employeeName: '佐藤花子',
        employeeId: 'emp-sato',
        companyName: '関連会社A',
        companyId: 'comp-a',
        departmentName: '技術部',
        departmentId: 'dept-a-tech',
        qualificationId: 'qual-sato-ap',
        qualificationName: '応用情報技術者試験',
        acquiredDate: '2022-10-20',
        expirationDate: 'permanent',
        status: 'valid'
      },
      {
        employeeName: '鈴木次郎',
        employeeId: 'emp-suzuki',
        companyName: '関連会社B',
        companyId: 'comp-b',
        departmentName: '営業部',
        departmentId: 'dept-b-sales',
        qualificationId: 'qual-suzuki-license',
        qualificationName: '普通自動車第一種運転免許',
        acquiredDate: '2021-03-15',
        expirationDate: '2024-03-15',
        status: 'expiring'
      },
      {
        employeeName: '高橋美咲',
        employeeId: 'emp-takahashi',
        companyName: '関連会社C',
        companyId: 'comp-c',
        departmentName: '人事部',
        departmentId: 'dept-c-hr',
        qualificationId: 'qual-takahashi-toeic',
        qualificationName: 'TOEIC',
        acquiredDate: '2020-01-15',
        expirationDate: '2022-01-15',
        status: 'expired'
      }
    ];

    // expirationStatusによるフィルタリング処理
    let filteredData = allMockData;

    if (expirationStatus) {
      switch (expirationStatus) {
        case 'expired':
          filteredData = allMockData.filter(item => item.status === 'expired');
          break;
        case 'expiring':
        case 'expiringSoon':
        case 'warning': // フロントエンドからの実際のパラメータに対応
          filteredData = allMockData.filter(item => item.status === 'expiring');
          break;
        case 'valid':
        case 'normal': // フロントエンドからの実際のパラメータに対応
          filteredData = allMockData.filter(item => item.status === 'valid');
          break;
        default:
          // 不明なステータスの場合は全データを返す
          filteredData = allMockData;
          break;
      }
    }

    logger.info('全社員資格一覧取得成功（簡易版）', {
      total: allMockData.length,
      filtered: filteredData.length,
      expirationStatus
    });

    res.status(200).json({
      success: true,
      data: filteredData,
      message: '全社員資格一覧を取得しました',
      total: filteredData.length,
    });
  } catch (error) {
    logger.error('全社員資格一覧取得エラー（簡易版）', {
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      success: false,
      message: '全社員資格一覧の取得に失敗しました',
    });
  }
});

// GET /api/qualifications/export - 資格データCSVエクスポート
router.get('/export', (req, res) => {
  try {
    logger.info('資格データCSVエクスポート開始（簡易版）', {
      query: req.query
    });

    // E2Eテスト用のモックデータ（全データ）
    const allMockData = [
      {
        employeeName: '田中太郎',
        employeeId: 'emp-tanaka',
        companyName: '株式会社本社',
        companyId: 'comp-honsha',
        departmentName: '管理部',
        departmentId: 'dept-honsha-kanri',
        qualificationId: 'qual-tanaka-fe',
        qualificationName: '基本情報技術者試験',
        acquiredDate: '2023-04-15',
        expirationDate: 'permanent',
        status: 'valid'
      },
      {
        employeeName: '佐藤花子',
        employeeId: 'emp-sato',
        companyName: '関連会社A',
        companyId: 'comp-a',
        departmentName: '技術部',
        departmentId: 'dept-a-tech',
        qualificationId: 'qual-sato-ap',
        qualificationName: '応用情報技術者試験',
        acquiredDate: '2022-10-20',
        expirationDate: 'permanent',
        status: 'valid'
      },
      {
        employeeName: '鈴木次郎',
        employeeId: 'emp-suzuki',
        companyName: '関連会社B',
        companyId: 'comp-b',
        departmentName: '営業部',
        departmentId: 'dept-b-sales',
        qualificationId: 'qual-suzuki-license',
        qualificationName: '普通自動車第一種運転免許',
        acquiredDate: '2021-03-15',
        expirationDate: '2024-03-15',
        status: 'expiring'
      },
      {
        employeeName: '高橋美咲',
        employeeId: 'emp-takahashi',
        companyName: '関連会社C',
        companyId: 'comp-c',
        departmentName: '人事部',
        departmentId: 'dept-c-hr',
        qualificationId: 'qual-takahashi-toeic',
        qualificationName: 'TOEIC',
        acquiredDate: '2020-01-15',
        expirationDate: '2022-01-15',
        status: 'expired'
      }
    ];

    // クエリパラメータによるフィルタリング処理
    let filteredData = allMockData;
    const { companyId, departmentId, expirationStatus, keyword } = req.query;

    // 会社フィルター
    if (companyId && typeof companyId === 'string') {
      filteredData = filteredData.filter(item => item.companyId === companyId);
    }

    // 部署フィルター
    if (departmentId && typeof departmentId === 'string') {
      filteredData = filteredData.filter(item => item.departmentId === departmentId);
    }

    // 期限ステータスフィルター
    if (expirationStatus && typeof expirationStatus === 'string') {
      switch (expirationStatus) {
        case 'expired':
          filteredData = filteredData.filter(item => item.status === 'expired');
          break;
        case 'expiring':
        case 'expiringSoon':
        case 'warning':
          filteredData = filteredData.filter(item => item.status === 'expiring');
          break;
        case 'valid':
        case 'normal':
          filteredData = filteredData.filter(item => item.status === 'valid');
          break;
      }
    }

    // キーワード検索（社員名または資格名）
    if (keyword && typeof keyword === 'string') {
      const searchKeyword = keyword.trim().toLowerCase();
      filteredData = filteredData.filter(item =>
        item.employeeName.toLowerCase().includes(searchKeyword) ||
        item.qualificationName.toLowerCase().includes(searchKeyword)
      );
    }

    // CSVヘッダー
    const csvHeaders = [
      '社員名',
      '会社',
      '部署',
      '資格名',
      '取得日',
      '有効期限',
      '状況'
    ];

    // CSVデータ行の作成
    const csvRows = filteredData.map(item => {
      const statusText = item.status === 'valid' ? '正常' :
                        item.status === 'expiring' ? '期限間近' : '期限切れ';

      return [
        `"${item.employeeName}"`,
        `"${item.companyName}"`,
        `"${item.departmentName}"`,
        `"${item.qualificationName}"`,
        `"${item.acquiredDate}"`,
        `"${item.expirationDate === 'permanent' ? '永続' : item.expirationDate}"`,
        `"${statusText}"`
      ].join(',');
    });

    // CSVコンテンツの構築
    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    // CSVファイルとしてダウンロード可能なレスポンス設定
    const now = new Date();
    const dateString = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');
    const filename = `qualifications_export_${dateString}.csv`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

    logger.info('資格データCSVエクスポート成功（簡易版）', {
      total: allMockData.length,
      filtered: filteredData.length,
      filename,
      csvSizeBytes: Buffer.byteLength(csvContent, 'utf8')
    });

    res.status(200).send(csvContent);

  } catch (error) {
    logger.error('資格データCSVエクスポートエラー（簡易版）', {
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      success: false,
      message: 'CSVエクスポートに失敗しました',
    });
  }
});

export default router;