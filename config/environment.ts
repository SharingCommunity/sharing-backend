export default {
  dev: {
    MONGO_URL: 'mongodb://localhost:27017/sharing',
    PORT: 3000,
    HOST: 'localhost',
  } as IEnvConfig,
};

interface IEnvConfig {
  MONGO_URL: string;
  PORT: number;
  HOST: string;
  [keys: string]: any;
}
