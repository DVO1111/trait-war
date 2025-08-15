// Honeycomb Protocol metrics and analytics utilities
interface TransactionMetrics {
  startTime: number;
  endTime?: number;
  success: boolean;
  error?: string;
  transactionType: string;
  walletAddress?: string;
}

class HoneycombMetrics {
  private static instance: HoneycombMetrics;
  private transactions: TransactionMetrics[] = [];
  private readonly MAX_STORED_TRANSACTIONS = 100;

  private constructor() {}

  public static getInstance(): HoneycombMetrics {
    if (!HoneycombMetrics.instance) {
      HoneycombMetrics.instance = new HoneycombMetrics();
    }
    return HoneycombMetrics.instance;
  }

  // Track transaction performance
  startTransaction(type: string, walletAddress?: string): string {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const metric: TransactionMetrics = {
      startTime: Date.now(),
      success: false,
      transactionType: type,
      walletAddress,
    };
    
    this.transactions.push(metric);
    
    // Keep only recent transactions
    if (this.transactions.length > this.MAX_STORED_TRANSACTIONS) {
      this.transactions.shift();
    }
    
    return id;
  }

  endTransaction(id: string, success: boolean, error?: string): void {
    const index = this.transactions.findIndex(tx => 
      tx.startTime.toString() === id.split('_')[1]
    );
    
    if (index !== -1) {
      this.transactions[index].endTime = Date.now();
      this.transactions[index].success = success;
      if (error) {
        this.transactions[index].error = error;
      }
    }
  }

  // Get performance metrics
  getAverageTransactionTime(type?: string): number {
    const filteredTxs = this.transactions.filter(tx => 
      tx.endTime && (!type || tx.transactionType === type)
    );
    
    if (filteredTxs.length === 0) return 0;
    
    const totalTime = filteredTxs.reduce((sum, tx) => 
      sum + (tx.endTime! - tx.startTime), 0
    );
    
    return totalTime / filteredTxs.length;
  }

  getSuccessRate(type?: string): number {
    const filteredTxs = this.transactions.filter(tx => 
      tx.endTime && (!type || tx.transactionType === type)
    );
    
    if (filteredTxs.length === 0) return 0;
    
    const successfulTxs = filteredTxs.filter(tx => tx.success).length;
    return successfulTxs / filteredTxs.length;
  }

  getRecentErrors(count: number = 5): string[] {
    return this.transactions
      .filter(tx => tx.error)
      .map(tx => tx.error!)
      .slice(-count);
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      totalTransactions: this.transactions.length,
      averageTime: this.getAverageTransactionTime(),
      successRate: this.getSuccessRate(),
      transactionTypes: [...new Set(this.transactions.map(tx => tx.transactionType))],
      recentErrors: this.getRecentErrors(),
      breakdown: this.getTransactionBreakdown(),
    };
  }

  private getTransactionBreakdown() {
    const breakdown: Record<string, { count: number; successRate: number; avgTime: number }> = {};
    
    const types = [...new Set(this.transactions.map(tx => tx.transactionType))];
    
    types.forEach(type => {
      const typeTxs = this.transactions.filter(tx => tx.transactionType === type);
      breakdown[type] = {
        count: typeTxs.length,
        successRate: this.getSuccessRate(type),
        avgTime: this.getAverageTransactionTime(type),
      };
    });
    
    return breakdown;
  }

  // Clear all metrics (useful for testing)
  clearMetrics(): void {
    this.transactions = [];
  }
}

export const honeycombMetrics = HoneycombMetrics.getInstance();

// Utility functions for common tracking
export const trackProjectCreation = (walletAddress?: string) => 
  honeycombMetrics.startTransaction('createProject', walletAddress);

export const trackProfileCreation = (walletAddress?: string) => 
  honeycombMetrics.startTransaction('createProfile', walletAddress);

export const trackCharacterCreation = (walletAddress?: string) => 
  honeycombMetrics.startTransaction('createCharacter', walletAddress);

export const trackMissionParticipation = (walletAddress?: string) => 
  honeycombMetrics.startTransaction('participateInMission', walletAddress);

export const trackTransactionEnd = (id: string, success: boolean, error?: string) =>
  honeycombMetrics.endTransaction(id, success, error);
