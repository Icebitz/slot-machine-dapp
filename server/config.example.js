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
    creatorWalletAddress: 'your_creator_wallet_address_here',
    mintAddress: 'your_mint_address_here'
  },
  
  // Event monitoring settings
  monitoring: {
    // How often to check for new events (in milliseconds)
    checkInterval: 1000,
    // Maximum number of events to keep in memory
    maxEvents: 1000
  },
  
  // WebSocket server configuration
  websocket: {
    port: 8080
  },
  
  // Slot machine game settings
  game: {
    // Round duration in milliseconds (30 minutes)
    roundDuration: 30 * 60 * 1000,
    // Percentage of creator fees given to winner (50%)
    winnerFeePercentage: 0.5
  }
};
