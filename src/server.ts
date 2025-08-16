import * as http from "http";
// import * as appInsights from "applicationinsights";
import * as fs from "fs";
import * as path from "path";

// const connectionString =
//   process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ||
//   "InstrumentationKey=a7f8a439-dc61-45c3-b3b9-436eaff36017;IngestionEndpoint=https://germanywestcentral-1.in.applicationinsights.azure.com/;LiveEndpoint=https://germanywestcentral.livediagnostics.monitor.azure.com/;ApplicationId=e703b063-04df-4de9-8b75-75c21121a56f";

// appInsights.setup(connectionString).setAutoCollectConsole(true, true).start();

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    const date = new Date().toISOString();
    console.log("debug: nice date", date);
    res.end(date);
  } else if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<html><body><h1>OK lalalal</h1></body></html>");
  } else if (req.method === "GET" && req.url === "/dist") {
    const distPath = path.join(__dirname, "..", "dist", "server.js");

    try {
      if (fs.existsSync(distPath)) {
        const sourceCode = fs.readFileSync(distPath, "utf8");
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(sourceCode);

        // Отправляем событие в Application Insights
        const client = appInsights.defaultClient;
        if (client) {
          client.trackEvent({
            name: "DistFileAccessed",
            properties: { filePath: distPath },
          });
        }
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end(`File not found: ${distPath}`);
      }
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(
        `Error reading file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  } else {
    console.log("debug: req.url", req.url);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Отправляем событие о запуске сервера
  const client = appInsights.defaultClient;
  if (client) {
    client.trackEvent({
      name: "ServerStarted",
      properties: { port: port },
    });
    console.log("Application Insights client initialized");
  } else {
    console.log("Application Insights client not available");
  }
});

// Принудительно отправляем данные при завершении
process.on("SIGINT", () => {
  const client = appInsights.defaultClient;
  if (client) {
    client.flush();
  }
  process.exit(0);
});
