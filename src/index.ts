import express from 'express';
import Redis from 'ioredis';

const PORT = process.env.PORT || 1000;
const LOCK_EXPIRY_MS = 1000;
const REDIS_URL = process.env.REDIS_URL || "localhost:6379";

const app = express();
const client = new Redis(REDIS_URL);

app.use(express.json());

app.get('/foo', async (req, res) => {
    const [[, error], [, result]] = await client
      .multi()
      .set("FOO", "BAR", "PX", LOCK_EXPIRY_MS, "NX")
      .get("FOO")
      .exec() || [];
    
    res.send({error, result});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
