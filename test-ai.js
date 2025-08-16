const appInsights = require("applicationinsights");

// Test connection string
const connectionString =
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ||
  "InstrumentationKey=a7f8a439-dc61-45c3-b3b9-436eaff36017;IngestionEndpoint=https://germanywestcentral-1.in.applicationinsights.azure.com/;LiveEndpoint=https://germanywestcentral.livediagnostics.monitor.azure.com/;ApplicationId=e703b063-04df-4de9-8b75-75c21121a56f";

console.log("Testing Application Insights connection...");
console.log("Connection string:", connectionString ? "Set" : "Not set");

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

  const client = appInsights.defaultClient;
  if (client) {
    console.log("Client is available, sending test events...");

    // Send test events
    client.trackEvent({
      name: "TestEvent",
      properties: { test: "value", timestamp: new Date().toISOString() },
    });

    client.trackTrace({ message: "Test trace message" });

    client.trackMetric({ name: "TestMetric", value: 42 });

    console.log("Test events sent successfully");

    // Flush and wait a bit
    client.flush();

    setTimeout(() => {
      console.log(
        "Test completed. Check your Azure Application Insights in 5-10 minutes."
      );
      process.exit(0);
    }, 5000);
  } else {
    console.error("Client is not available");
    process.exit(1);
  }
} catch (error) {
  console.error("Failed to initialize Application Insights:", error);
  process.exit(1);
}
