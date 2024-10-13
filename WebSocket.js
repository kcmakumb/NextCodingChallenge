const WebSocket = require("ws");

// Create a WebSocket server on port 8080
const server = new WebSocket.Server({ port: 8080 });

// Track all connected clients with unique IDs
let clients = new Map(); // Map to store clients with their IDs
let clientIDCounter = 0; // Counter to generate unique client IDs

// Handle new client connections
server.on("connection", (ws) => {
  try {
    clientIDCounter++; // Increment the client ID counter
    const clientID = clientIDCounter; // Assign a unique ID to this client
    clients.set(clientID, ws); // Store the client with their ID

    const connectionMessage = `Client ${clientID} connected`;
    console.log(`[${new Date().toISOString()}] ${connectionMessage}`);

    // Send a welcome message to the new client only
    ws.send("Hello! You've successfully connected to the WebSocket server!");

    // Broadcast the connection message to other clients
    broadcastMessage(connectionMessage, ws);

    // Handle messages from the client
    ws.on("message", (message) => {
      const logMessage = `Client ${clientID} says: ${message}`;
      console.log(`[${new Date().toISOString()}] ${logMessage}`);

      // Broadcast the client's message to all other clients
      broadcastMessage(logMessage, ws);
    });

    // Handle client disconnection
    ws.on("close", () => {
      const disconnectMessage = `Client ${clientID} disconnected`;
      console.log(`[${new Date().toISOString()}] ${disconnectMessage}`);
      clients.delete(clientID); // Remove the client from the map

      // Notify all remaining clients about the disconnection
      broadcastMessage(disconnectMessage);
    });

    // Handle WebSocket errors
    ws.on("error", (error) => {
      console.error(
        `[${new Date().toISOString()}] WebSocket error with Client ${clientID}:`,
        error
      );
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error during connection setup:`,
      error
    );
  }
});

// Function to broadcast a message to all clients except the sender
function broadcastMessage(message, sender = null) {
  clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        console.log(`[${new Date().toISOString()}] Broadcast: ${message}`);
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Failed to broadcast message: ${error}`
        );
      }
    }
  });
}

// Start the WebSocket server
server.on("listening", () => {
  console.log(
    `[${new Date().toISOString()}] WebSocket server is running on ws://localhost:8080`
  );
});

// Handle server errors
server.on("error", (error) => {
  console.error(`[${new Date().toISOString()}] WebSocket server error:`, error);
});
