"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneTracker = void 0;
const logger_1 = __importDefault(require("../../src/lib/logger"));
/**
 * マイルストーントラッカー - @テスト品質検証（@9）が活用する処理時間計測ユーティリティ
 * Winston Loggerを使用し、開発時のみ詳細出力、本番では最小限のログ出力
 */
class MilestoneTracker {
    milestones = {};
    startTime = Date.now();
    currentOp = "初期化";
    // 操作の設定
    setOperation(op) {
        this.currentOp = op;
        logger_1.default.debug('テスト操作開始', {
            operation: op,
            elapsed: this.getElapsed()
        });
    }
    // マイルストーンの記録
    mark(name) {
        this.milestones[name] = Date.now();
        logger_1.default.debug('マイルストーン到達', {
            milestone: name,
            elapsed: this.getElapsed()
        });
    }
    // 結果表示（@9のデバッグで重要）
    summary() {
        const entries = Object.entries(this.milestones).sort((a, b) => a[1] - b[1]);
        const steps = [];
        for (let i = 1; i < entries.length; i++) {
            const prev = entries[i - 1];
            const curr = entries[i];
            const diff = (curr[1] - prev[1]) / 1000;
            steps.push({
                from: prev[0],
                to: curr[0],
                duration: parseFloat(diff.toFixed(2))
            });
        }
        logger_1.default.info('処理時間分析完了', {
            totalTime: this.getElapsed(),
            steps,
            totalSteps: entries.length
        });
    }
    // 経過時間の取得
    getElapsed() {
        return `${((Date.now() - this.startTime) / 1000).toFixed(2)}秒`;
    }
}
exports.MilestoneTracker = MilestoneTracker;
//# sourceMappingURL=MilestoneTracker.js.map