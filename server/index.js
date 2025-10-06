// Load configuration
let config;
try {
  config = require('./config.js');
} catch (error) {
  console.log('⚠️  config.js not found. Using example configuration.');
  console.log('📝 Please copy config.example.js to config.js and update with your values.');
  config = require('./config.example.js');
}

// Import modules
const Database = require('./db');
const SlotMachine = require('./slotMachine');
const WebSocketServer = require('./websocket');
const PumpFunMonitor = require('./monitor');

class SlotMachineBackend {
  constructor() {
    this.database = new Database();
    this.websocket = new WebSocketServer(config.websocket?.port || 8080);
    this.slotMachine = new SlotMachine(this.database);
    this.pumpFunMonitor = new PumpFunMonitor(config, this.database, this.slotMachine, this.websocket);
    
    console.log('🎰 Slot Machine Backend Starting...');
    console.log(`📍 Monitoring mint: ${config.pumpFun.mintAddress}`);
    console.log(`👤 Creator wallet: ${config.pumpFun.creatorWalletAddress}`);
  }

  async start() {
    try {
      // Initialize database
      await this.database.init();
      
      // Start WebSocket server
      this.websocket.start();
      
      // Start slot machine auto-rounds
      this.slotMachine.startAutoRounds();
      
      // Start pump.fun monitoring
      await this.pumpFunMonitor.start();
      
      console.log('✅ Backend started successfully!');
      console.log('📊 Monitoring for buy/sell events...');
      console.log('🎯 Slot machine rounds running every 30 minutes');
      console.log('🌐 WebSocket server ready for frontend connections\n');
      
      // Start periodic stats broadcasting
      this.startStatsBroadcasting();
      
    } catch (error) {
      console.error('❌ Failed to start backend:', error.message);
      process.exit(1);
    }
  }

  startStatsBroadcasting() {
    // Broadcast stats every 30 seconds
    setInterval(() => {
      const stats = this.slotMachine.getGameStats();
      this.websocket.broadcastStats(stats);
      
      // Log stats to console
      console.log(`\n📊 Stats: ${stats.totalEvents} events (${stats.buyEvents} buys, ${stats.sellEvents} sells)`);
      console.log(`💰 Creator fees: ${stats.creatorFees.toFixed(6)} SOL`);
      console.log(`🏆 Total winners: ${stats.totalWinners}`);
      console.log(`🎯 Current round: ${stats.round} (${stats.buyersCount} buyers)`);
      console.log(`⏰ Time remaining: ${stats.timeRemaining}s`);
    }, 30000);

    // Broadcast round updates every 5 seconds
    setInterval(() => {
      const roundInfo = this.slotMachine.getRoundInfo();
      this.websocket.broadcastRoundUpdate(roundInfo);
    }, 5000);
  }

  stop() {
    console.log('\n🛑 Shutting down gracefully...');
    this.pumpFunMonitor.stop();
    this.websocket.stop();
    console.log('✅ Backend stopped');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  if (backend) {
    backend.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (backend) {
    backend.stop();
  }
  process.exit(0);
});

// Start the backend
const backend = new SlotMachineBackend();
backend.start().catch(console.error);
