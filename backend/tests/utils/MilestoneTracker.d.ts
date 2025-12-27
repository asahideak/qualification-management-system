/**
 * マイルストーントラッカー - @テスト品質検証（@9）が活用する処理時間計測ユーティリティ
 * Winston Loggerを使用し、開発時のみ詳細出力、本番では最小限のログ出力
 */
export declare class MilestoneTracker {
    private milestones;
    private startTime;
    private currentOp;
    setOperation(op: string): void;
    mark(name: string): void;
    summary(): void;
    private getElapsed;
}
//# sourceMappingURL=MilestoneTracker.d.ts.map