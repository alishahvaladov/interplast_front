# InterPlus - Decorative Products Website

A simple Node.js Express server to serve the InterPlus decorative products website.

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 14 or higher recommended)

2. Install the dependencies:

```bash
npm install
```

## Running the Server

### Production mode:

```bash
npm start
```

### Development mode (with auto-restart on file changes):

```bash
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Available Routes

- Home page: http://localhost:3000/
- Products page: http://localhost:3000/products
- About Us page: http://localhost:3000/about-us

## API Endpoints

- Contact form submission: POST http://localhost:3000/api/contact-request

## File Structure

- `server.js` - The main Express server file
- `home.html` - The home page
- `products.html` - The products page
- `about-us.html` - The about us page
- `assets/` - Static assets (JavaScript, CSS, images)
