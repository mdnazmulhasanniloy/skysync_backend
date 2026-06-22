import { createClient } from 'redis';
import colors from 'colors';
import { Queue } from 'bullmq';
import config from '../config';

const redisHost = config.redis_host || 'project_format_redis';
const redisPort = parseInt(config.redis_port || '6379');
const redisUrl = `redis://${redisHost}:${redisPort}`;

const pubClient = createClient({
  url: redisUrl,
  password: config.redis_password as string,
});
const subClient = pubClient.duplicate({
  password: config.redis_password as string,
});

const connection = {
  host: redisHost,
  port: redisPort,
  password: config.redis_password as string,
};

const connectRedis = async () => {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  console.log(colors.blue.bold('✨ Connected to Redis server'));
};

// BullMQ Queue (use proper connection object)
const messageQueue = new Queue('save_messages', {
  connection,
});

// const messageQueue = new Queue('save_messages', {
//   connection: pubClient,
// });

// Subscribe to new message channel
subClient.subscribe('new_message_channel', async rawMessage => {
  const message = JSON.parse(rawMessage);

  // Bonus part: Save to message queue
  await messageQueue.add('save', message);

  // Emit to receiver via socket
  const receiverSocketId = await pubClient.hGet(
    'socket_map',
    message.receiverId,
  );
  if (receiverSocketId) {
    // io.to(receiverSocketId).emit('new_message', message);
  }
});

export { pubClient, subClient, connectRedis, messageQueue };
