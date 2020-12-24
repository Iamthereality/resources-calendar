const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    process.env.REACT_APP_API_URL,
    createProxyMiddleware({
      target: 'http://127.0.0.1',
      changeOrigin: true
    })
  );
};
