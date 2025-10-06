const { Connection, PublicKey } = require('@solana/web3.js');

class PumpFunMonitor {
  constructor(config, database, slotMachine, websocket) {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
    this.config = config;
    this.database = database;
    this.slotMachine = slotMachine;
    this.websocket = websocket;
    this.isRunning = false;
    this.processedSignatures = new Set();
    
    console.log('🔍 Pump.fun Monitor initialized');
    console.log(`📍 Monitoring mint: ${config.pumpFun.mintAddress}`);
    console.log(`👤 Creator wallet: ${config.pumpFun.creatorWalletAddress}`);
  }

  async start() {
    try {
      console.log('🔌 Connecting to Solana network...');
      
      // Start monitoring pump.fun events
      await this.startPumpFunMonitoring();
      
      this.isRunning = true;
      console.log('✅ Pump.fun Monitor started successfully!');
      console.log('📊 Monitoring for buy/sell events...\n');
      
    } catch (error) {
      console.error('❌ Failed to start Pump.fun Monitor:', error.message);
      throw error;
    }
  }

  async startPumpFunMonitoring() {
    // Monitor pump.fun events using their API
    setInterval(async () => {
      await this.checkPumpFunEvents();
    }, this.config.monitoring.checkInterval);
  }

  async checkPumpFunEvents() {
    try {
      // Get recent transactions for the mint address
      const mintPublicKey = new PublicKey(this.config.pumpFun.mintAddress);
      
      // Get recent signatures for the mint
      const signatures = await this.connection.getSignaturesForAddress(mintPublicKey, {
        limit: 10
      });

      for (const signature of signatures) {
        if (!this.processedSignatures.has(signature.signature)) {
          await this.processTransaction(signature.signature);
          this.processedSignatures.add(signature.signature);
        }
      }
      
    } catch (error) {
      console.error('Error checking pump.fun events:', error.message);
    }
  }

  async processTransaction(signature) {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!transaction) return;

      // Check if this is a buy or sell transaction
      const event = await this.analyzeTransaction(transaction, signature);
      
      if (event) {
        this.handleEvent(event);
      }
      
    } catch (error) {
      console.error('Error processing transaction:', error.message);
    }
  }

  async analyzeTransaction(transaction, signature) {
    try {
      const logs = transaction.meta?.logMessages || [];
      
      // Look for pump.fun specific logs
      const pumpFunLogs = logs.filter(log => 
        log.includes('pump') || 
        log.includes('bonding') || 
        log.includes('swap')
      );

      if (pumpFunLogs.length === 0) return null;

      // Determine if it's a buy or sell
      const isBuy = pumpFunLogs.some(log => 
        log.includes('buy') || 
        log.includes('swap') ||
        log.includes('bonding')
      );

      const isSell = pumpFunLogs.some(log => 
        log.includes('sell') || 
        log.includes('unbond')
      );

      if (!isBuy && !isSell) return null;

      // Extract transaction details
      const preBalances = transaction.meta?.preBalances || [];
      const postBalances = transaction.meta?.postBalances || [];
      const accountKeys = transaction.transaction.message.accountKeys;

      // Find the user's account (not the mint or creator)
      let userAccount = null;
      let userBalanceChange = 0;
      let creatorFee = 0;

      for (let i = 0; i < accountKeys.length; i++) {
        const accountKey = accountKeys[i].toString();
        if (accountKey !== this.config.pumpFun.mintAddress && 
            accountKey !== this.config.pumpFun.creatorWalletAddress) {
          userAccount = accountKey;
          userBalanceChange = (postBalances[i] || 0) - (preBalances[i] || 0);
        }
        
        // Check if this is the creator wallet for fee calculation
        if (accountKey === this.config.pumpFun.creatorWalletAddress) {
          creatorFee = (postBalances[i] || 0) - (preBalances[i] || 0);
        }
      }

      return {
        type: isBuy ? 'BUY' : 'SELL',
        signature: signature,
        user: userAccount,
        balanceChange: userBalanceChange,
        creatorFee: creatorFee,
        timestamp: new Date().toISOString(),
        slot: transaction.slot,
        logs: pumpFunLogs
      };

    } catch (error) {
      console.error('Error analyzing transaction:', error.message);
      return null;
    }
  }

  handleEvent(event) {
    // Log the event
    this.logEvent(event);
    
    // Store in database
    this.database.addEvent(event);
    
    // Add to slot machine if it's a buy
    this.slotMachine.addBuyer(event);
    
    // Add creator fee if applicable
    if (event.creatorFee > 0) {
      this.slotMachine.addCreatorFee(event.creatorFee);
    }
    
    // Broadcast to WebSocket clients
    this.websocket.broadcastEvent(event);
    
    // Broadcast updated stats
    this.websocket.broadcastStats(this.slotMachine.getGameStats());
  }

  logEvent(event) {
    const timestamp = new Date().toLocaleTimeString();
    const type = event.type === 'BUY' ? '🟢 BUY' : '🔴 SELL';
    const user = event.user ? event.user.slice(0, 8) + '...' : 'Unknown';
    const balanceChange = event.balanceChange / 1e9; // Convert lamports to SOL
    const creatorFee = event.creatorFee / 1e9;
    
    console.log(`[${timestamp}] ${type} | User: ${user} | Balance: ${balanceChange.toFixed(4)} SOL`);
    if (creatorFee > 0) {
      console.log(`   💰 Creator fee: ${creatorFee.toFixed(6)} SOL`);
    }
    console.log(`   Signature: ${event.signature}`);
    console.log(`   Slot: ${event.slot}`);
    console.log('   ─────────────────────────────────────────');
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Pump.fun Monitor stopped');
  }
}

module.exports = PumpFunMonitor;
