const WebSocket = require('ws');

class WebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.wss = null;
    this.clients = new Set();
    this.isRunning = false;
  }

  start() {
    this.wss = new WebSocket.Server({ port: this.port });
    
    this.wss.on('connection', (ws) => {
      console.log('🔌 New client connected');
      this.clients.add(ws);
      
      // Send initial data
      this.sendToClient(ws, {
        type: 'connection',
        message: 'Connected to Slot Machine Backend',
        timestamp: new Date().toISOString()
      });

      ws.on('close', () => {
        console.log('🔌 Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    this.isRunning = true;
    console.log(`🌐 WebSocket server running on port ${this.port}`);
  }

  sendToClient(client, data) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Event broadcasting methods
  broadcastEvent(event) {
    this.broadcast({
      type: 'event',
      data: event,
      timestamp: new Date().toISOString()
    });
  }

  broadcastWinner(winner) {
    this.broadcast({
      type: 'winner',
      data: winner,
      timestamp: new Date().toISOString()
    });
  }

  broadcastRoundUpdate(roundInfo) {
    this.broadcast({
      type: 'round_update',
      data: roundInfo,
      timestamp: new Date().toISOString()
    });
  }

  broadcastStats(stats) {
    this.broadcast({
      type: 'stats',
      data: stats,
      timestamp: new Date().toISOString()
    });
  }

  getClientCount() {
    return this.clients.size;
  }

  stop() {
    if (this.wss) {
      this.wss.close();
      this.isRunning = false;
      console.log('🔌 WebSocket server stopped');
    }
  }
}

module.exports = WebSocketServer;
