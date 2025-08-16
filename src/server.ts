import * as http from "http";
import * as appInsights from "applicationinsights";

// Используем переменную окружения для connection string
const connectionString =
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ||
  "InstrumentationKey=a7f8a439-dc61-45c3-b3b9-436eaff36017;IngestionEndpoint=https://germanywestcentral-1.in.applicationinsights.azure.com/;LiveEndpoint=https://germanywestcentral.livediagnostics.monitor.azure.com/;ApplicationId=e703b063-04df-4de9-8b75-75c21121a56f";

console.log("Connection string:", connectionString ? "Set" : "Not set");

// Проверяем, что connection string не пустая
if (!connectionString) {
  console.error("APPLICATIONINSIGHTS_CONNECTION_STRING is not set");
  process.exit(1);
}

// Простая конфигурация без дублирования
try {
  appInsights
    .setup(connectionString)
    .setAutoCollectConsole(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectDependencies(true)
    .start();

  console.log("Application Insights initialized successfully");

  // Проверяем, что клиент доступен
  const client = appInsights.defaultClient;
  if (client) {
    console.log("Application Insights client is available");
    // Отправляем тестовое событие при запуске
    client.trackEvent({
      name: "ApplicationStarted",
      properties: { environment: process.env.NODE_ENV || "development" },
    });
  } else {
    console.error(
      "Application Insights client is not available after initialization"
    );
  }
} catch (error) {
  console.error("Failed to initialize Application Insights:", error);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    const date = new Date().toISOString();
    console.log("debug: date", date);

    // Отправляем кастомное событие в Application Insights
    const client = appInsights.defaultClient;
    if (client) {
      client.trackEvent({
        name: "HomePageAccessed",
        properties: { timestamp: date },
      });
      client.trackTrace({ message: `Home page accessed at ${date}` });
    }

    res.end(date);
  } else if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  } else if (req.method === "GET" && req.url === "/env") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(
      `${process.env.APPLICATIONINSIGHTS_CONNECTION_STRING} ${JSON.stringify(
        process.env
      )}`
    );
  } else if (req.method === "GET" && req.url === "/test-ai") {
    res.writeHead(200, { "Content-Type": "text/plain" });

    // Тестируем Application Insights
    const client = appInsights.defaultClient;
    if (client) {
      client.trackEvent({
        name: "TestEvent",
        properties: { test: "value" },
      });
      client.trackTrace({ message: "Test trace message" });
      client.trackMetric({ name: "TestMetric", value: 42 });
      res.end("Application Insights test events sent");
    } else {
      res.end("Application Insights client not available");
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
