import logger from '../../src/lib/logger';

/**
 * マイルストーントラッカー - @テスト品質検証（@9）が活用する処理時間計測ユーティリティ
 * Winston Loggerを使用し、開発時のみ詳細出力、本番では最小限のログ出力
 */
export class MilestoneTracker {
  private milestones: Record<string, number> = {};
  private startTime: number = Date.now();
  private currentOp: string = "初期化";

  // 操作の設定
  setOperation(op: string): void {
    this.currentOp = op;
    logger.debug('テスト操作開始', {
      operation: op,
      elapsed: this.getElapsed()
    });
  }

  // マイルストーンの記録
  mark(name: string): void {
    this.milestones[name] = Date.now();
    logger.debug('マイルストーン到達', {
      milestone: name,
      elapsed: this.getElapsed()
    });
  }

  // 結果表示（@9のデバッグで重要）
  summary(): void {
    const entries = Object.entries(this.milestones).sort((a, b) => a[1] - b[1]);
    const steps: Array<{ from: string; to: string; duration: number }> = [];

    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i-1];
      const curr = entries[i];
      const diff = (curr[1] - prev[1]) / 1000;
      steps.push({
        from: prev[0],
        to: curr[0],
        duration: parseFloat(diff.toFixed(2))
      });
    }

    logger.info('処理時間分析完了', {
      totalTime: this.getElapsed(),
      steps,
      totalSteps: entries.length
    });
  }

  // 経過時間の取得
  private getElapsed(): string {
    return `${((Date.now() - this.startTime) / 1000).toFixed(2)}秒`;
  }
}