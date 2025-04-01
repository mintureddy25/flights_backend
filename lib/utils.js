const { createClient } = require("redis");

const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

// Connect to Redis
client.connect().catch(console.error);

// Function to put a job into the Redis queue
async function putJob(data, queueName) {
    const jobData = JSON.stringify(data);
    await client.lPush(queueName, jobData);
    console.log(`Job added to queue: ${jobData}`);
}

// Export the putJob function for use in other modules
module.exports = {
    putJob
};
