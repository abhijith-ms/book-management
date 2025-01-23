const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Use environment variable for port or default to 5000
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'books.json');

const readData = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Set response content type
  res.setHeader('Content-Type', 'application/json');

  // Handle API routes
  if (url === '/api/books' && method === 'GET') {
    const books = readData();
    res.statusCode = 200;
    res.end(JSON.stringify(books));
  } else if (url === '/api/books' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      const newBook = { id: uuidv4(), ...JSON.parse(body) };
      const books = readData();
      books.push(newBook);
      writeData(books);
      res.statusCode = 201;
      res.end(JSON.stringify(newBook));
    });
  } else if (url.startsWith('/api/books/') && method === 'PUT') {
    const id = url.split('/')[3];
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      const books = readData();
      const index = books.findIndex((book) => book.id === id);
      if (index === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Book not found' }));
      } else {
        books[index] = { ...books[index], ...JSON.parse(body) };
        writeData(books);
        res.statusCode = 200;
        res.end(JSON.stringify(books[index]));
      }
    });
  } else if (url.startsWith('/api/books/') && method === 'DELETE') {
    const id = url.split('/')[3];
    const books = readData();
    const filteredBooks = books.filter((book) => book.id !== id);
    if (books.length === filteredBooks.length) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'Book not found' }));
    } else {
      writeData(filteredBooks);
      res.statusCode = 200;
      res.end(JSON.stringify({ message: 'Book deleted successfully' }));
    }
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});