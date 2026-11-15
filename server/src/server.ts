import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

app.listen(config.port, config.host, () => {
  console.log(`🚀 Blogs API running in ${config.nodeEnv} mode at http://${config.host}:${config.port}`);
});
