import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      BACKEND_URL: process.env.BACKEND_URL,
    },
  };
};
