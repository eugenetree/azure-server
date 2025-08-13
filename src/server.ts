let appInsights = require("applicationinsights");
appInsights.setup().start();

import * as http from 'http';

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    const date = new Date().toISOString();
    console.log('debug: date', date);
    res.end(date);
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else if (req.method === 'GET' && req.url === '/env') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`${process.env.APPLICATIONINSIGHTS_CONNECTION_STRING} ${JSON.stringify(process.env)}`);
  }
  else {
    console.log('debug: req.url', req.url);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
