const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    process.env.REACT_APP_API_URL,
    createProxyMiddleware({
      target: 'https://bazis-motors.bitrix24.ru/',
      changeOrigin: true
    })
  );
};
