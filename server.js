// Import required modules
const express = require("express");
const path = require("path");
const fs = require("fs");

// Create Express app
const app = express();

// Define port - use environment variable PORT or default to 3000
const PORT = process.env.PORT || 4001;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Set up middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
// Home page route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

// Products page route
app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "products.html"));
});

// About Us page route
app.get("/about-us", (req, res) => {
  res.sendFile(path.join(__dirname, "about-us.html"));
});

app.get("/category", (req, res) => {
  res.sendFile(path.join(__dirname, "category.html"));
});

// API endpoint for contact form submissions
app.post("/api/contact-request", (req, res) => {
  const formData = req.body;
  console.log("Received contact form submission:", formData);

  // In a real application, you would save this data to a database
  // For now, we'll just log it and send a success response

  res.status(200).json({
    success: true,
    message: "Contact request received successfully",
  });
});

// Handle 404 errors - page not found
app.use((req, res) => {
  // Check if 404.html exists before trying to send it
  fs.access(path.join(__dirname, "404.html"), fs.constants.F_OK, (err) => {
    if (err) {
      // If 404.html doesn't exist, send a basic 404 message
      res
        .status(404)
        .send(
          '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p><a href="/">Go to Home</a>'
        );
    } else {
      // If 404.html exists, send the file
      res.status(404).sendFile(path.join(__dirname, "404.html"));
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`- Home page: http://localhost:${PORT}/`);
  console.log(`- Products page: http://localhost:${PORT}/products`);
  console.log(`- About Us page: http://localhost:${PORT}/about-us`);
});
