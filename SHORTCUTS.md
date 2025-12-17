# BulletApi v1.4.0 - Shortcuts Update

## What's New

BulletApi now includes powerful shortcuts to make development faster and easier!

### Application Shortcuts

#### 1. **quickStart()** - One-Line Server Start
```javascript
app.quickStart(3000); // Instead of app.listen(3000)
```

#### 2. **allow()** - Route Access Control
```javascript
app.get('/admin', 
    app.allow(req => req.query.admin === 'true', 'Admin access required'),
    (req, res) => {
        res.json({ message: 'Welcome admin!' });
    }
);
```

#### 3. **ban()** - Block Access
```javascript
app.get('/content',
    app.ban(req => req.query.blocked === 'true', 'You are blocked'),
    (req, res) => {
        res.json({ message: 'Content here' });
    }
);
```

#### 4. **redirect()** - Quick Redirects
```javascript
app.redirect('/old-page', '/new-page');
app.redirect('/docs', 'https://github.com/amineichou/BulletApi', 301);
```

#### 5. **group()** - Route Grouping
```javascript
app.group('/api/v1', (router) => {
    router.get('/users', (req, res) => {
        res.json({ users: [] });
    });
    
    router.post('/users', (req, res) => {
        res.status(201).json({ message: 'User created' });
    });
});
```

### Middleware Shortcuts

#### 6. **cors()** - Enable CORS
```javascript
import { cors } from 'bulletapi';
app.use(cors()); // Simple
app.use(cors({ origin: 'https://example.com', credentials: true })); // Custom
```

#### 7. **logger()** - Request Logging
```javascript
import { logger } from 'bulletapi';
app.use(logger({ format: 'short' }));    // GET /api/users 200 - 15ms
app.use(logger({ format: 'detailed' })); // With timestamp & user-agent
```

#### 8. **staticFiles()** - Serve Static Files
```javascript
import { staticFiles } from 'bulletapi';
app.use(staticFiles('./public'));
app.use(staticFiles('./public', { index: 'index.html', dotfiles: 'ignore' }));
```

#### 9. **rateLimit()** - API Rate Limiting
```javascript
import { rateLimit } from 'bulletapi';
const limiter = rateLimit({
    windowMs: 60000,  // 1 minute
    max: 100,         // 100 requests per minute
    message: 'Too many requests'
});

app.use(limiter); // Global
app.post('/api/submit', limiter, handler); // Per-route
```

#### 10. **basicAuth()** - HTTP Basic Authentication
```javascript
import { basicAuth } from 'bulletapi';
app.get('/admin',
    basicAuth({ username: 'admin', password: 'secret123' }),
    (req, res) => {
        res.json({ message: 'Admin panel' });
    }
);
```

#### 11. **timeout()** - Request Timeout
```javascript
import { timeout } from 'bulletapi';
app.use(timeout(30000)); // 30 second timeout
app.get('/slow', timeout(5000), handler); // Per-route timeout
```

#### 12. **sizeLimit()** - Limit Request Size
```javascript
import { sizeLimit } from 'bulletapi';
app.use(sizeLimit({ max: 5 * 1024 * 1024 })); // 5MB limit
```

### Response Helper

#### 13. **res.redirect()** - Redirect Response
```javascript
app.get('/old', (req, res) => {
    res.redirect('/new', 302); // Temporary redirect
});
```

## Installation

```bash
npm install bulletapi@1.4.0
```

## Complete Example

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

// Start server with quickStart
app.quickStart(3000);
```

## Benefits

- **Less Code**: Write less boilerplate code
- **Faster Development**: Common tasks in one line
- **Cleaner Code**: More readable and maintainable
- **Best Practices**: Built-in security and performance features
- **Easy to Use**: Intuitive API design

## Breaking Changes

None! This is a backward-compatible update.

## Links
- [npm Package](https://www.npmjs.com/package/bulletapi)
- [GitHub Repository](https://github.com/amineichou/BulletApi)
- [Full Documentation](https://github.com/amineichou/BulletApi#readme)
