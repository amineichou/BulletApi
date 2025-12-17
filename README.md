# BulletApi Framework
A lightweight Node.js web framework, designed for building web applications with middleware support and route handling.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Shortcuts](#shortcuts)
- [Usage](#usage)
  - [Creating an Application](#creating-an-application)
  - [Routing](#routing)
  - [Middleware](#middleware)
  - [Body Parsing](#body-parsing)
  - [Request Object](#request-object)
  - [Response Object](#response-object)
  - [Error Handling](#error-handling)
- [API Reference](#api-reference)
- [Development Status](#development-status)

## Features

### Core Features
- Middleware pipeline with async support
- Multiple handlers per route
- Async/await handler support
- Automatic query string parsing (`req.query`)
- Dynamic route parameters (`/users/:id` → `req.params`)
- Response helpers (`res.json()`, `res.send()`, `res.status()`, `res.redirect()`)
- Body parsers (JSON, URL-encoded, raw, text)
- Error handling (automatic try/catch)
- HTTP methods: GET, POST, PUT, DELETE, HEAD, OPTIONS
- URL parsing with pathname extraction

### Shortcuts & Utilities
- **Quick Start** - Start server with one line: `app.quickStart(3000)`
- **Access Control** - `app.allow()` and `app.ban()` for route protection
- **Redirects** - Quick redirects: `app.redirect('/old', '/new')`
- **Route Grouping** - Group routes with common prefix
- **CORS** - Enable CORS with one line
- **Logger** - Automatic request logging
- **Static Files** - Serve static files easily
- **Rate Limiting** - Protect from API abuse
- **Basic Auth** - HTTP Basic Authentication
- **Request Timeout** - Set timeout for requests
- **Size Limit** - Limit request body size

## Installation

```bash
npm install bulletapi
```

## Quick Start

**CommonJs Example:**
```javascript
const { BulletApi } = require("bulletapi");

const app = new BulletApi();
```

**ESM Example:**
```javascript
import { BulletApi } from "bulletapi";

const app = new BulletApi();
```

### Example Application
```javascript
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

```javascript
import { BulletApi } from 'bulletapi';

const app = new BulletApi();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

## Shortcuts

BulletApi provides powerful shortcuts to make your code cleaner and more concise.

### Quick Start

Start your server with a single function call:

```javascript
import { BulletApi } from 'bulletapi';

const app = new BulletApi();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Instead of app.listen(3000)
app.quickStart(3000); // Starts server with one line!
```

### Access Control: Allow & Ban

Control route access with simple one-liners:

```javascript
// Allow access only if condition is met
app.get('/admin', 
    app.allow(req => req.query.admin === 'true', 'Admin access required'),
    (req, res) => {
        res.json({ message: 'Welcome admin!' });
    }
);

// Ban access if condition is met
app.get('/content',
    app.ban(req => req.query.blocked === 'true', 'You are blocked'),
    (req, res) => {
        res.json({ message: 'Content here' });
    }
);

// Use functions for dynamic checks
const isAuthenticated = (req) => req.headers.authorization === 'Bearer token';

app.get('/protected',
    app.allow(isAuthenticated, 'Authentication required'),
    (req, res) => {
        res.json({ data: 'secret' });
    }
);
```

### Quick Redirects

Set up redirects in one line:

```javascript
// Temporary redirect (302)
app.redirect('/old-page', '/new-page');

// Permanent redirect (301)
app.redirect('/docs', 'https://github.com/amineichou/BulletApi', 301);
```

### Route Grouping

Group routes with a common prefix:

```javascript
app.group('/api/v1', (router) => {
    router.get('/users', (req, res) => {
        res.json({ users: [] });
    });
    
    router.post('/users', (req, res) => {
        res.status(201).json({ message: 'User created' });
    });
    
    router.get('/posts', (req, res) => {
        res.json({ posts: [] });
    });
});

// Creates routes: /api/v1/users, /api/v1/posts
```

### CORS

Enable CORS with one line:

```javascript
import { BulletApi, cors } from 'bulletapi';

const app = new BulletApi();

// Simple CORS - allow all origins
app.use(cors());

// Custom CORS configuration
app.use(cors({
    origin: 'https://example.com',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
    maxAge: 86400
}));
```

### Request Logger

Log all requests automatically:

```javascript
import { BulletApi, logger } from 'bulletapi';

const app = new BulletApi();

// Short format: "GET /api/users 200 - 15ms"
app.use(logger({ format: 'short' }));

// Detailed format with timestamp and user agent
app.use(logger({ format: 'detailed' }));
```

### Static File Serving

Serve static files from a directory:

```javascript
import { BulletApi, staticFiles } from 'bulletapi';

const app = new BulletApi();

// Serve files from 'public' directory
app.use(staticFiles('./public'));

// With custom options
app.use(staticFiles('./public', {
    index: 'index.html',
    dotfiles: 'ignore' // ignore hidden files
}));
```

### Rate Limiting

Protect your API from abuse:

```javascript
import { BulletApi, rateLimit } from 'bulletapi';

const app = new BulletApi();

// Global rate limiting
app.use(rateLimit({
    windowMs: 60000,  // 1 minute
    max: 100,         // 100 requests per minute
    message: 'Too many requests'
}));

// Per-route rate limiting
const limiter = rateLimit({
    windowMs: 60000,
    max: 5
});

app.post('/api/submit', limiter, (req, res) => {
    res.json({ message: 'Success' });
});
```

### Basic Authentication

Add basic auth protection:

```javascript
import { BulletApi, basicAuth } from 'bulletapi';

const app = new BulletApi();

// Protect specific routes
app.get('/admin',
    basicAuth({ username: 'admin', password: 'secret123' }),
    (req, res) => {
        res.json({ message: 'Admin panel' });
    }
);

// Custom realm
app.get('/secure',
    basicAuth({ 
        username: 'user', 
        password: 'pass', 
        realm: 'My Secure Area' 
    }),
    (req, res) => {
        res.json({ data: 'secure data' });
    }
);
```

### Request Timeout

Set timeout for long-running requests:

```javascript
import { BulletApi, timeout } from 'bulletapi';

const app = new BulletApi();

// Global timeout of 30 seconds
app.use(timeout(30000));

// Per-route timeout
app.get('/slow', timeout(5000), async (req, res) => {
    await slowOperation();
    res.json({ message: 'Done' });
});
```

### Size Limit

Limit request body size:

```javascript
import { BulletApi, sizeLimit } from 'bulletapi';

const app = new BulletApi();

// Limit to 5MB
app.use(sizeLimit({ max: 5 * 1024 * 1024 }));

// Per-route size limit
app.post('/upload', sizeLimit({ max: 10 * 1024 * 1024 }), (req, res) => {
    res.json({ message: 'Upload successful' });
});
```

### Complete Example

```javascript
import { 
    BulletApi, 
    json, 
    cors, 
    logger, 
    rateLimit,
    basicAuth 
} from 'bulletapi';

const app = new BulletApi();

// Apply shortcuts
app.use(logger({ format: 'detailed' }));
app.use(cors());
app.use(json());

// Rate limiter
const limiter = rateLimit({ windowMs: 60000, max: 10 });

// Routes with shortcuts
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to BulletApi!' });
});

app.get('/admin',
    basicAuth({ username: 'admin', password: 'secret' }),
    (req, res) => {
        res.json({ message: 'Admin area' });
    }
);

app.post('/api/data', limiter, (req, res) => {
    res.json({ received: req.body });
});

app.redirect('/old', '/new');

// Start server
app.quickStart(3000);
```

## Usage

### Creating an Application

Create an instance of BulletApi to start building your application:

```javascript
import { BulletApi } from 'bulletapi';

const app = new BulletApi();
```

### Routing

BulletApi provides methods for all standard HTTP verbs. Routes are matched in the order they are defined.

#### Basic Routes

```javascript
// GET request
app.get('/users', (req, res) => {
    res.json({ users: [] });
});

// POST request
app.post('/users', (req, res) => {
    res.status(201).json({ message: 'User created' });
});

// PUT request
app.put('/users/:id', (req, res) => {
    res.json({ message: 'User updated' });
});

// DELETE request
app.delete('/users/:id', (req, res) => {
    res.status(204).send();
});
```

#### Dynamic Route Parameters

Capture values from the URL using named parameters:

```javascript
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ userId, name: 'John Doe' });
});

app.get('/posts/:postId/comments/:commentId', (req, res) => {
    const { postId, commentId } = req.params;
    res.json({ postId, commentId });
});
```

#### Multiple Handlers

Chain multiple handlers for a single route:

```javascript
const authenticate = (req, res, next) => {
    // Authentication logic
    next();
};

const validateUser = (req, res, next) => {
    // Validation logic
    next();
};

app.post('/users', authenticate, validateUser, (req, res) => {
    res.status(201).json({ message: 'User created' });
});
```

### Middleware

Middleware functions have access to the request and response objects, and the `next` function.

#### Application-Level Middleware

```javascript
// Logger middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Async middleware
app.use(async (req, res, next) => {
    req.timestamp = Date.now();
    await someAsyncOperation();
    next();
});
```

#### Middleware Execution Order

Middleware executes in the order it's defined:

```javascript
app.use((req, res, next) => {
    console.log('First');
    next();
});

app.use((req, res, next) => {
    console.log('Second');
    next();
});

app.get('/test', (req, res) => {
    console.log('Handler');
    res.send('Done');
});
// Output: First, Second, Handler
```

### Body Parsing

BulletApi provides built-in body parsers for handling different content types.

#### JSON Body Parser

Parse JSON request bodies:

```javascript
import { BulletApi, json } from 'bulletapi';

const app = new BulletApi();

// Use JSON body parser
app.use(json());

app.post('/api/users', (req, res) => {
    console.log(req.body); // { name: 'John', email: 'john@example.com' }
    res.status(201).json({
        message: 'User created',
        user: req.body
    });
});
```

#### URL-Encoded Body Parser

Parse URL-encoded form data:

```javascript
import { BulletApi, urlencoded } from 'bulletapi';

const app = new BulletApi();

// Use URL-encoded body parser
app.use(urlencoded());

app.post('/api/form', (req, res) => {
    console.log(req.body); // { username: 'john', password: 'secret' }
    res.json({ message: 'Form submitted' });
});
```

#### Combined Body Parsers

Use multiple body parsers to handle different content types:

```javascript
import { BulletApi, json, urlencoded } from 'bulletapi';

const app = new BulletApi();

// Parse JSON and URL-encoded bodies
app.use(json());
app.use(urlencoded());

app.post('/api/data', (req, res) => {
    // Handles both application/json and application/x-www-form-urlencoded
    res.json({ received: req.body });
});
```

#### Body Parser Options

Configure body parsers with size limits:

```javascript
// Limit body size to 100KB
app.use(json({ limit: 100 * 1024 }));

// Limit URL-encoded bodies to 50KB
app.use(urlencoded({ limit: 50 * 1024 }));
```

#### Raw and Text Parsers

For raw buffer or text data:

```javascript
import { BulletApi, raw, text } from 'bulletapi';

const app = new BulletApi();

// Raw body parser (returns Buffer)
app.use(raw());

// Text body parser (returns string)
app.use(text());
```

### Request Object

The request object represents the HTTP request and contains properties for the query string, parameters, body, and more.

#### Properties

- `req.method` - HTTP method (GET, POST, etc.)
- `req.url` - Full request URL
- `req.path` - URL pathname
- `req.query` - Parsed query string parameters
- `req.params` - Route parameters
- `req.body` - Parsed request body (requires body parser middleware)

#### Example

```javascript
app.get('/search', (req, res) => {
    // URL: /search?q=nodejs&limit=10
    console.log(req.query.q);      // 'nodejs'
    console.log(req.query.limit);  // '10'
    res.json(req.query);
});

app.get('/users/:userId', (req, res) => {
    // URL: /users/123
    console.log(req.params.userId); // '123'
    res.json({ id: req.params.userId });
});
```

### Response Object

The response object represents the HTTP response that the app sends when it receives an HTTP request.

#### Methods

##### `res.send(data)`
Send a response of various types:

```javascript
app.get('/text', (req, res) => {
    res.send('Hello, World!');
});

app.get('/html', (req, res) => {
    res.send('<h1>Hello, World!</h1>');
});

app.get('/buffer', (req, res) => {
    res.send(Buffer.from('Hello'));
});
```

##### `res.json(data)`
Send a JSON response:

```javascript
app.get('/api/users', (req, res) => {
    res.json({ 
        users: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
        ]
    });
});
```

##### `res.status(code)`
Set the HTTP status code (chainable):

```javascript
app.post('/users', (req, res) => {
    res.status(201).json({ message: 'Created' });
});

app.get('/not-found', (req, res) => {
    res.status(404).send('Not Found');
});

app.delete('/users/:id', (req, res) => {
    res.status(204).send();
});
```

### Error Handling

BulletApi automatically wraps async handlers in try-catch blocks:

```javascript
app.get('/users/:id', async (req, res) => {
    // Errors are automatically caught
    const user = await db.findUser(req.params.id);
    res.json(user);
});
```

## API Reference

### Application

#### `app.use(middleware)`
Register application-level middleware.

**Parameters:**
- `middleware` (Function): Middleware function with signature `(req, res, next)`

#### `app.get(path, ...handlers)`
Register a GET route.

**Parameters:**
- `path` (String): URL path (supports parameters like `/users/:id`)
- `...handlers` (Function): One or more handler functions

#### `app.post(path, ...handlers)`
Register a POST route.

#### `app.put(path, ...handlers)`
Register a PUT route.

#### `app.delete(path, ...handlers)`
Register a DELETE route.

#### `app.head(path, ...handlers)`
Register a HEAD route.

#### `app.options(path, ...handlers)`
Register an OPTIONS route.

#### `app.listen(port, [callback])`
Start the HTTP server.

**Parameters:**
- `port` (Number): Port number to listen on
- `callback` (Function): Optional callback executed when server starts

**Returns:** HTTP server instance

#### `app.quickStart(port, [callback])`
Shortcut to start server with default settings.

**Parameters:**
- `port` (Number): Port number (default: 3000)
- `callback` (Function): Optional callback

**Returns:** The app instance for chaining

#### `app.allow(condition, [message])`
Create middleware to allow access based on condition.

**Parameters:**
- `condition` (Function|Boolean): Function that receives req and returns boolean, or static boolean
- `message` (String): Error message if access denied (default: 'Access denied')

**Returns:** Middleware function

#### `app.ban(condition, [message])`
Create middleware to block access based on condition.

**Parameters:**
- `condition` (Function|Boolean): Function that receives req and returns boolean, or static boolean
- `message` (String): Error message if access forbidden (default: 'Access forbidden')

**Returns:** Middleware function

#### `app.redirect(from, to, [statusCode])`
Create a redirect route.

**Parameters:**
- `from` (String): Source path
- `to` (String): Destination path or URL
- `statusCode` (Number): HTTP status code (default: 302)

**Returns:** The app instance for chaining

#### `app.group(prefix, callback)`
Group routes with a common prefix.

**Parameters:**
- `prefix` (String): Common path prefix for all routes in group
- `callback` (Function): Function that receives router object with route methods

**Returns:** The app instance for chaining

#### `app.global(middleware)`
Apply middleware globally (alias for `app.use()`).

**Parameters:**
- `middleware` (Function): Middleware function

**Returns:** The app instance for chaining

### Body Parsers

#### `json([options])`
Create JSON body parser middleware.

**Parameters:**
- `options.limit` (Number): Maximum body size in bytes (default: 1MB)

**Returns:** Middleware function

#### `urlencoded([options])`
Create URL-encoded body parser middleware.

**Parameters:**
- `options.limit` (Number): Maximum body size in bytes (default: 1MB)

**Returns:** Middleware function

#### `raw([options])`
Create raw body parser middleware (returns Buffer).

**Parameters:**
- `options.limit` (Number): Maximum body size in bytes (default: 1MB)

**Returns:** Middleware function

#### `text([options])`
Create text body parser middleware (returns string).

**Parameters:**
- `options.limit` (Number): Maximum body size in bytes (default: 1MB)

**Returns:** Middleware function

### Shortcut Middleware

#### `cors([options])`
Enable CORS (Cross-Origin Resource Sharing).

**Parameters:**
- `options.origin` (String): Allowed origin (default: '*')
- `options.methods` (String): Allowed methods (default: 'GET,HEAD,PUT,PATCH,POST,DELETE')
- `options.allowedHeaders` (String): Allowed headers (default: '*')
- `options.credentials` (Boolean): Allow credentials (default: false)
- `options.maxAge` (Number): Max age for preflight cache in seconds (default: 86400)

**Returns:** Middleware function

#### `logger([options])`
Log HTTP requests.

**Parameters:**
- `options.format` (String): 'short' or 'detailed' (default: 'short')

**Returns:** Middleware function

#### `staticFiles(directory, [options])`
Serve static files from a directory.

**Parameters:**
- `directory` (String): Directory path to serve files from
- `options.index` (String): Index filename (default: 'index.html')
- `options.dotfiles` (String): How to handle dotfiles: 'ignore' or 'allow' (default: 'ignore')

**Returns:** Middleware function

#### `rateLimit([options])`
Limit repeated requests from same IP.

**Parameters:**
- `options.windowMs` (Number): Time window in milliseconds (default: 60000)
- `options.max` (Number): Max requests per window (default: 100)
- `options.message` (String): Error message when limit exceeded

**Returns:** Middleware function

#### `basicAuth(options)`
Add HTTP Basic Authentication.

**Parameters:**
- `options.username` (String): Required username
- `options.password` (String): Required password
- `options.realm` (String): Authentication realm (default: 'Secure Area')

**Returns:** Middleware function

#### `timeout(ms)`
Set request timeout.

**Parameters:**
- `ms` (Number): Timeout in milliseconds (default: 30000)

**Returns:** Middleware function

#### `sizeLimit([options])`
Limit request body size.

**Parameters:**
- `options.max` (Number): Maximum size in bytes (default: 1048576 = 1MB)

**Returns:** Middleware function

### Response Methods

#### `res.redirect(url, [statusCode])`
Redirect to another URL.

**Parameters:**
- `url` (String): Destination URL
- `statusCode` (Number): HTTP status code (default: 302)

## Development Status

| Feature                           | Status              |
| --------------------------------- | ------------------- |
| Middleware pipeline               | ✅ Done             |
| Multiple handlers per route       | ✅ Done             |
| Async handler support             | ✅ Done             |
| Query parser                      | ✅ Done             |
| Error handling (try/catch)        | ✅ Done             |
| HEAD method support               | ✅ Done             |
| Route params (/:id)               | ✅ Done             |
| Response helpers                  | ✅ Done             |
| JSON body parser                  | ✅ Done             |
| URL-encoded body parser           | ✅ Done             |
| Raw body parser                   | ✅ Done             |
| Text body parser                  | ✅ Done             |
| Quick start shortcut              | ✅ Done             |
| Access control (allow/ban)        | ✅ Done             |
| Route redirects                   | ✅ Done             |
| Route grouping                    | ✅ Done             |
| CORS middleware                   | ✅ Done             |
| Logger middleware                 | ✅ Done             |
| Static file serving               | ✅ Done             |
| Rate limiting                     | ✅ Done             |
| Basic authentication              | ✅ Done             |
| Request timeout                   | ✅ Done             |
| Size limit                        | ✅ Done             |
| Error middleware                  | ❌ Not implemented  |
| Router class                      | ❌ Not implemented  |
| Path matching (wildcards, arrays) | ❌ Not implemented  |
| Settings system                   | ❌ Not implemented  |