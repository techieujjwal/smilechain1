

// Store transactions in localStorage
export interface MockTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  type: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

export const mockBlockchain = {
  // Generate a random mock transaction hash (Ethereum style)
  generateTxHash: () => {
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  },

  // Simulates sending a transaction on-chain
  sendTransaction: async (data: any): Promise<any> => {
    // Artificial delay for realism (1-3 seconds)
    const delay = Math.floor(Math.random() * 2000) + 1000;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const txHash = mockBlockchain.generateTxHash();
        
        // Save to mock history
        const newTx: MockTransaction = {
          hash: txHash,
          from: data.from || 'mock_user_address',
          to: data.to || 'mock_contract_address',
          amount: data.amount || '0',
          type: data.type || 'contract_interaction',
          status: 'success',
          timestamp: Date.now(),
        };
        mockBlockchain.saveTransaction(newTx);
        
        resolve({
          hash: txHash,
          wait: async (confirmations: number = 1) => {
            return await mockBlockchain.simulateConfirmation(confirmations);
          }
        });
      }, delay);
    });
  },

  // Mock waiting for block confirmations
  simulateConfirmation: async (confirmations: number = 1) => {
    // Simulating block confirmation time (approx 1 sec per confirmation simulation)
    return new Promise((resolve) => setTimeout(() => resolve({ status: 1 }), confirmations * 1000));
  },

  saveTransaction: (tx: MockTransaction) => {
    try {
      const history = mockBlockchain.getTransactionHistory();
      history.unshift(tx); // add to top
      localStorage.setItem('mock_tx_history', JSON.stringify(history));
    } catch(e) { console.error('Failed to save mock tx:', e) }
  },

  // Gets transaction history from localStorage
  getTransactionHistory: (): MockTransaction[] => {
    try {
      const history = localStorage.getItem('mock_tx_history');
      return history ? JSON.parse(history) : [];
    } catch (e) {
      return [];
    }
  },

  // Mock balance for UI
  getMockUserBalance: () => {
    return "100.00"; // Fake starting balance for demo purposes
  },
  
  // Mock total pool funds
  getMockPoolFunds: () => {
    return "424.20"; // Fake pool funds
  }
};
