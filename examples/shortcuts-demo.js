import { 
    BulletApi, 
    json, 
    cors, 
    logger, 
    staticFiles, 
    rateLimit, 
    basicAuth,
    timeout,
    sizeLimit
} from './src/index.js';

const app = new BulletApi();

// ===== SHORTCUT EXAMPLES =====

// 1. Quick Start - Start server with one line
// app.quickStart(3000);

// 2. Logger - Log all requests automatically
app.use(logger({ format: 'detailed' }));

// 3. CORS - Enable CORS with one line
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));

// 4. Request timeout - Set global timeout
app.use(timeout(5000)); // 5 second timeout

// 5. Size limit - Limit request body size
app.use(sizeLimit({ max: 5 * 1024 * 1024 })); // 5MB limit

// 6. Body parsers
app.use(json());

// 7. Serve static files from a directory
// app.use(staticFiles('./public'));

// 8. Rate limiting - Protect from abuse
const limiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many requests from this IP'
});

// 9. Allow/Ban shortcuts - Control access with one line
app.get('/public', (req, res) => {
    res.json({ message: 'This is public' });
});

app.get('/admin', 
    app.allow(req => req.query.admin === 'true', 'Admin access required'),
    (req, res) => {
        res.json({ message: 'Welcome admin!' });
    }
);

app.get('/blocked',
    app.ban(req => req.query.blocked === 'true', 'You are blocked'),
    (req, res) => {
        res.json({ message: 'Access granted' });
    }
);

// 10. Basic authentication
app.get('/secure',
    basicAuth({ username: 'admin', password: 'secret123' }),
    (req, res) => {
        res.json({ message: 'Secure data' });
    }
);

// 11. Rate limited endpoint
app.post('/api/submit', limiter, (req, res) => {
    res.json({ message: 'Submission received', data: req.body });
});

// 12. Quick redirects
app.redirect('/old-page', '/new-page');
app.redirect('/docs', 'https://github.com/amineichou/BulletApi', 301);

// 13. Route grouping with common prefix
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

// 14. Chaining with global method
app.global((req, res, next) => {
    console.log('Global middleware executed');
    next();
});

// 15. Multiple route protection patterns
const isAuthenticated = (req) => req.headers.authorization === 'Bearer secret-token';
const isNotBanned = (req) => !req.query.banned;

app.get('/protected',
    app.allow(isAuthenticated, 'Authentication required'),
    app.ban(req => req.query.banned === 'true', 'User is banned'),
    (req, res) => {
        res.json({ message: 'Protected resource', user: 'authenticated user' });
    }
);

// Regular route
app.get('/', (req, res) => {
    res.json({
        message: 'BulletApi Shortcuts Demo',
        shortcuts: [
            'quickStart() - Start server with defaults',
            'allow() - Allow access based on condition',
            'ban() - Block access based on condition',
            'redirect() - Quick route redirects',
            'group() - Group routes with common prefix',
            'global() - Apply middleware globally',
            'cors() - Enable CORS',
            'logger() - Request logging',
            'staticFiles() - Serve static files',
            'rateLimit() - Rate limiting',
            'basicAuth() - Basic authentication',
            'timeout() - Request timeout',
            'sizeLimit() - Limit request size'
        ]
    });
});

// Using quickStart instead of listen
app.quickStart(3000);

console.log(`
🚀 BulletApi Shortcuts Demo Running!

Try these endpoints:
- GET  /                 - Home page with all shortcuts
- GET  /public           - Public endpoint
- GET  /admin?admin=true - Admin only (with allow)
- GET  /blocked          - Test ban (add ?blocked=true to block)
- GET  /secure           - Basic auth (admin:secret123)
- POST /api/submit       - Rate limited endpoint
- GET  /old-page         - Redirects to /new-page
- GET  /api/v1/users     - Grouped routes
- GET  /protected        - Multiple protections
  (requires header: Authorization: Bearer secret-token)
  (add ?banned=true to test ban)
`);
