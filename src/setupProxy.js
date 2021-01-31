const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    process.env.REACT_APP_API_URL,
    createProxyMiddleware({
      target: 'https://bm.it-building24.ru/calendar/',
      changeOrigin: true
    })
  );
};
