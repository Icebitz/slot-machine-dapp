const Database = require('./database');

class SlotMachine {
  constructor(database) {
    this.database = database;
    this.roundDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    this.feePercentage = 0.5; // 50% of creator fees to winner
    this.currentRoundBuyers = [];
    this.isRoundActive = false;
    
    console.log('🎰 Slot Machine initialized');
    console.log(`⏰ Round duration: ${this.roundDuration / 60000} minutes`);
    console.log(`💰 Winner gets ${this.feePercentage * 100}% of creator fees`);
  }

  startRound() {
    this.isRoundActive = true;
    this.currentRoundBuyers = [];
    this.database.startNewRound();
    console.log(`🎯 Round ${this.database.getCurrentRound()} started!`);
  }

  endRound() {
    if (!this.isRoundActive) return;
    
    this.isRoundActive = false;
    const winner = this.selectWinner();
    
    if (winner) {
      this.processWinner(winner);
    } else {
      console.log('🎯 No buyers in this round - no winner');
    }
    
    // Start next round
    setTimeout(() => {
      this.startRound();
    }, 1000);
  }

  selectWinner() {
    if (this.currentRoundBuyers.length === 0) {
      return null;
    }

    // Last buyer wins
    const winner = this.currentRoundBuyers[this.currentRoundBuyers.length - 1];
    console.log(`🏆 Winner selected: ${winner.user} (last buyer)`);
    
    return winner;
  }

  processWinner(winner) {
    const stats = this.database.getStats();
    const winnerAmount = stats.creatorFees * this.feePercentage;
    
    if (winnerAmount > 0) {
      const winnerData = {
        user: winner.user,
        amount: winnerAmount,
        round: this.database.getCurrentRound(),
        timestamp: new Date().toISOString(),
        signature: winner.signature,
        balanceChange: winner.balanceChange
      };

      this.database.addWinner(winnerData);
      this.database.updateCreatorFees(-winnerAmount); // Deduct from creator fees
      
      console.log(`🎉 Winner ${winner.user} receives ${winnerAmount.toFixed(6)} SOL!`);
      console.log(`💰 Remaining creator fees: ${(stats.creatorFees - winnerAmount).toFixed(6)} SOL`);
    } else {
      console.log('💰 No creator fees to distribute');
    }
  }

  addBuyer(event) {
    if (event.type === 'BUY') {
      this.currentRoundBuyers.push({
        user: event.user,
        signature: event.signature,
        balanceChange: event.balanceChange,
        timestamp: event.timestamp
      });
      
      console.log(`👤 New buyer added: ${event.user}`);
    }
  }

  addCreatorFee(amount) {
    this.database.updateCreatorFees(amount);
    console.log(`💰 Creator fees increased by ${amount.toFixed(6)} SOL`);
  }

  getRoundInfo() {
    const roundStartTime = this.database.getRoundStartTime();
    const timeElapsed = Date.now() - roundStartTime;
    const timeRemaining = this.roundDuration - timeElapsed;
    
    return {
      round: this.database.getCurrentRound(),
      isActive: this.isRoundActive,
      timeElapsed: Math.floor(timeElapsed / 1000),
      timeRemaining: Math.floor(timeRemaining / 1000),
      buyersCount: this.currentRoundBuyers.length,
      currentBuyers: this.currentRoundBuyers
    };
  }

  getGameStats() {
    const stats = this.database.getStats();
    const roundInfo = this.getRoundInfo();
    
    return {
      ...stats,
      ...roundInfo,
      feePercentage: this.feePercentage,
      roundDuration: this.roundDuration / 60000 // in minutes
    };
  }

  // Auto-start rounds
  startAutoRounds() {
    console.log('🔄 Auto-round system started');
    this.startRound();
    
    setInterval(() => {
      this.endRound();
    }, this.roundDuration);
  }
}

module.exports = SlotMachine;
