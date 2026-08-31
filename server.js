const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = process.env.PORT || 8080;

// HTTP Server for Health Checks & Cold-Start Wakeup
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'SyncWatch Production Relay',
      activeRooms: rooms.size,
      timestamp: Date.now()
    }));
    return;
  }

  res.writeHead(404);
  res.end();
});

// WSS Server
const wss = new WebSocketServer({ server });

/**
 * In-Memory Room Store
 * RoomId -> { clients: Set<WebSocket>, hostRole: WebSocket, videoState: Object }
 */
const rooms = new Map();

wss.on('connection', (ws, req) => {
  let userRoomId = null;
  let userRole = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'REGISTER') {
        userRoomId = msg.roomId;
        userRole = msg.role; // 'HOST' or 'GUEST'

        if (!rooms.has(userRoomId)) {
          rooms.set(userRoomId, {
            clients: new Set(),
            createdAt: Date.now(),
            videoState: {}
          });
        }

        const room = rooms.get(userRoomId);

        // Security: Max 2 users per room rule
        if (room.clients.size >= 2 && !room.clients.has(ws)) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            code: 'ROOM_FULL',
            message: 'Bu oda 2 kişilik kapasitesine ulaştı.'
          }));
          ws.close();
          return;
        }

        room.clients.add(ws);
        console.log(`[WSS] User registered in room ${userRoomId} as ${userRole}. (Total in room: ${room.clients.size})`);

        // Notify partner that peer connected
        room.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'PEER_CONNECTED',
              roomId: userRoomId,
              partnerRole: userRole,
              timestamp: Date.now()
            }));
          }
        });
        return;
      }

      // Broadcast Sync Messages (PLAY, PAUSE, SEEK, HEARTBEAT, JOIN_REQUEST, JOIN_ACK)
      if (userRoomId && rooms.has(userRoomId)) {
        const room = rooms.get(userRoomId);
        room.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
      }
    } catch (err) {
      console.error('[WSS] Message parsing error:', err.message);
    }
  });

  ws.on('close', () => {
    if (userRoomId && rooms.has(userRoomId)) {
      const room = rooms.get(userRoomId);
      room.clients.delete(ws);
      console.log(`[WSS] User left room ${userRoomId}. (Remaining: ${room.clients.size})`);

      // Notify remaining peer
      room.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'PARTNER_LEFT',
            roomId: userRoomId,
            timestamp: Date.now()
          }));
        }
      });

      if (room.clients.size === 0) {
        rooms.delete(userRoomId);
        console.log(`[WSS] Cleaned up empty room ${userRoomId}`);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 SyncWatch High-Capacity Relay Server running on port ${PORT}`);
});
