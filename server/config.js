// Configuration file for the slot machine backend
// Copy this to config.js and fill in your actual values

module.exports = {
  // Solana RPC Configuration
  solana: {
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com'
  },
  
  // Pump.fun Configuration
  pumpFun: {
    creatorWalletAddress: '69x1WKAZFJzMgmZ79aVyQ2PshNqXfxjpEWAz32hjrpr3',
    mintAddress: '73dMMMmkzpXzUfB2m9L4E9eRfKPEi7Gm8YvA1x4FJLh'
  },
  
  // Event monitoring settings
  monitoring: {
    // How often to check for new events (in milliseconds)
    checkInterval: 1000,
    // Maximum number of events to keep in memory
    maxEvents: 1000
  }
};
