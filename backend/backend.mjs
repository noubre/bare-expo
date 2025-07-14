import Hyperswarm from 'hyperswarm';
import crypto from 'hypercore-crypto';
import b4a from 'b4a';
const { IPC } = BareKit;
let swarm = null;
let conn = null;
IPC.on('data', (data) => {
  const msg = JSON.parse(b4a.toString(data));
  switch (msg.type) {
    case 'connect':
      const topicHex = msg.topic;
      const topic = b4a.from(topicHex, 'hex');
      swarm = new Hyperswarm();
      swarm.join(topic, { server: false, client: true });
      swarm.on('connection', (connection) => {
        conn = connection;
        conn.on('data', (connData) => {
          const response = JSON.parse(b4a.toString(connData));
          IPC.write(b4a.from(JSON.stringify(response)));
        });
        conn.on('close', () => {
          conn = null;
          IPC.write(b4a.from(JSON.stringify({ type: 'disconnected' })));
        });
        conn.on('error', (err) => {
          IPC.write(b4a.from(JSON.stringify({ type: 'error', error: err.message })));
        });
        conn.write(b4a.from(JSON.stringify({ type: 'handshake' })));
      });
      break;
    case 'send':
      if (conn) {
        conn.write(b4a.from(JSON.stringify(msg.data)));
      }
      break;
  }
});
