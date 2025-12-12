# BulletApi Framework
A lightweight Node.js web framework, designed for building web applications with middleware support and route handling.

| Feature                           | Required? | BulletApi Framework      |
| --------------------------------- | --------- | ------------------------ |
| Middleware pipeline               | Yes       | Done                     |
| Multiple handlers per route       | Yes       | Done                     |
| Async handler support             | Yes       | Done                     |
| Query parser                      | Yes       | Done                     |
| Error handling (try/catch)        | Yes       | Done                     |
| HEAD method support               | Yes       | Done                     |
| Route params (/:id)               | Yes       | Done                     |
| Response helpers                  | Yes       | Done                     |
| JSON body parser                  | Yes       | Not implemented          |
| Error middleware                  | Yes       | Not implemented          |
| Router class                      | Yes       | Not implemented          |
| Path matching (wildcards, arrays) | Later     | Not implemented          |
| Settings system                   | Optional  | Not implemented          |

## Sample Usage

```javascript
import { BulletApi } from './src/bulletapi.js';
const app = new BulletApi();

// Async middleware
app.use(async (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Sync handler
app.get('/hello', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
});

// Async handler with query params and response helpers
app.get('/api/data', async (req, res) => {
    console.log('Query params:', req.query); // Automatically parsed
    await someAsyncOperation();
    res.json({ status: 'ok' }); // Use res.json() helper
});

// Dynamic route with response helpers
app.get('/users/:id', (req, res) => {
    res.json({ userId: req.params.id, message: `User found` });
});

// Status code chaining
app.post('/api/create', (req, res) => {
    res.status(201).json({ message: 'Created' });
});

app.listen(3000);
```

## Features
- Middleware pipeline with async support
- Multiple handlers per route
- Async/await handler support
- Automatic query string parsing (`req.query`)
- Dynamic route parameters (`/users/:id` → `req.params`)
- Response helpers (`res.json()`, `res.send()`, `res.status()`)
- Error handling (automatic try/catch)
- HTTP methods: GET, POST, PUT, DELETE, HEAD, OPTIONS
- URL parsing with pathname extraction

## Installation

```bash
npm install bulletapi
```

## Usage

```javascript
import { BulletApi } from './src/bulletapi.js';
const app = new BulletApi();

// Async middleware
app.use(async (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Simple response helpers
app.get('/hello', (req, res) => {
    res.send('Hello, World!');
});

// JSON responses
app.get('/api/data', async (req, res) => {
    console.log('Query params:', req.query);
    await someAsyncOperation();
    res.json({ status: 'ok' });
});

// Status code chaining
app.post('/api/users', (req, res) => {
    res.status(201).json({ message: 'User created' });
});

// Dynamic routes
app.get('/users/:id', (req, res) => {
    res.json({ userId: req.params.id });
});

app.listen(3000);
```