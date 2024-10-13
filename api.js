const PORT = 8080;
const http = require("http");

// Sample in-memory store for resources
let resources = [];

// Create an HTTP server
const server = http.createServer((req, res) => {
  const { method, url } = req; // Parse request method and URL

  // Log incoming request
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  try {
    if (url === "/resources" && method === "GET") {
      // GET /resources - Read all resources
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(resources));
      console.log(`Resources fetched: ${JSON.stringify(resources)}`);
    } else if (url === "/resources" && method === "POST") {
      // POST /resources - Create a new resource
      let body = "";

      // Listen for incoming data chunks and convert them to a string.
      // Append each chunk to the 'body' variable to build the complete request body.
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const newResource = JSON.parse(body); // Handle invalid JSON
          resources.push(newResource);

          // Log the updated resources array
          console.log(`Resource added: ${JSON.stringify(newResource)}`);
          console.log(`Current resources: ${JSON.stringify(resources)}`);

          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(newResource));
        } catch (error) {
          // Handle JSON parsing error
          console.error("Invalid JSON:", error.message);
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Invalid JSON format");
        }
      });
    } else if (url.startsWith("/resources/") && method === "DELETE") {
      // DELETE /resources/:id - Delete a resource by ID
      const resourceId = url.split("/")[2];
      const originalLength = resources.length;
      resources = resources.filter((resource) => resource.id !== resourceId);

      if (resources.length === originalLength) {
        console.warn(`Resource with ID ${resourceId} not found`);
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end(`Resource with ID ${resourceId} not found`);
      } else {
        console.log(`Resource with ID ${resourceId} deleted`);
        console.log(
          `Current resources after deletion: ${JSON.stringify(resources)}`
        );
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`Resource with ID ${resourceId} deleted`);
      }
    } else {
      // Handle unknown routes
      console.warn(`404 Not Found: ${method} ${url}`);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  } catch (error) {
    // Catch unexpected errors
    console.error("Unexpected error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

// Start the server on port 8080
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
