const fs = require('fs').promises;
const path = require('path');

class Database {
  constructor() {
    this.dataFile = path.join(__dirname, '../data/slot-machine-data.json');
    this.data = {
      events: [],
      winners: [],
      creatorFees: 0,
      totalDistributed: 0,
      currentRound: 1,
      lastWinner: null,
      roundStartTime: Date.now()
    };
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
      const data = await fs.readFile(this.dataFile, 'utf8');
      this.data = { ...this.data, ...JSON.parse(data) };
      console.log('📁 Database initialized');
    } catch (error) {
      console.log('📁 Creating new database file');
      await this.save();
    }
  }

  async save() {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  addEvent(event) {
    this.data.events.push({
      ...event,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 1000 events
    if (this.data.events.length > 1000) {
      this.data.events = this.data.events.slice(-1000);
    }
    
    this.save();
  }

  addWinner(winner) {
    this.data.winners.push(winner);
    this.data.lastWinner = winner;
    this.data.totalDistributed += winner.amount;
    this.save();
  }

  updateCreatorFees(amount) {
    this.data.creatorFees += amount;
    this.save();
  }

  getCurrentRound() {
    return this.data.currentRound;
  }

  getRoundStartTime() {
    return this.data.roundStartTime;
  }

  startNewRound() {
    this.data.currentRound++;
    this.data.roundStartTime = Date.now();
    this.save();
  }

  getEvents() {
    return this.data.events;
  }

  getWinners() {
    return this.data.winners;
  }

  getStats() {
    return {
      totalEvents: this.data.events.length,
      totalWinners: this.data.winners.length,
      creatorFees: this.data.creatorFees,
      totalDistributed: this.data.totalDistributed,
      currentRound: this.data.currentRound,
      lastWinner: this.data.lastWinner
    };
  }

  getRecentEvents(limit = 50) {
    return this.data.events.slice(-limit);
  }

  getRecentWinners(limit = 10) {
    return this.data.winners.slice(-limit);
  }
}

module.exports = Database;
