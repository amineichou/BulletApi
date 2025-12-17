import { BulletApi, json, cors, logger } from './src/index.js';

const app = new BulletApi();

// Test shortcuts
console.log('Testing BulletApi Shortcuts...\n');

// Test logger
app.use(logger({ format: 'short' }));

// Test CORS
app.use(cors());

// Test JSON parser
app.use(json());

// Test allow/ban
app.get('/test-allow', 
    app.allow(req => req.query.pass === 'yes', 'Access denied'),
    (req, res) => {
        res.json({ message: 'Allowed!' });
    }
);

app.get('/test-ban',
    app.ban(req => req.query.banned === 'yes', 'You are banned'),
    (req, res) => {
        res.json({ message: 'Not banned!' });
    }
);

// Test redirect
app.redirect('/old', '/new');

// Test group
app.group('/api', (router) => {
    router.get('/users', (req, res) => {
        res.json({ users: ['Alice', 'Bob'] });
    });
    
    router.post('/users', (req, res) => {
        res.status(201).json({ message: 'User created', data: req.body });
    });
});

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'BulletApi Shortcuts Test',
        endpoints: [
            'GET  /test-allow?pass=yes',
            'GET  /test-ban (try ?banned=yes)',
            'GET  /old (redirects to /new)',
            'GET  /api/users',
            'POST /api/users'
        ]
    });
});

app.get('/new', (req, res) => {
    res.json({ message: 'Redirected successfully!' });
});

// Use quickStart instead of listen
app.quickStart(3000);

console.log('All shortcuts initialized successfully!');
console.log('Server running on http://localhost:3000');
