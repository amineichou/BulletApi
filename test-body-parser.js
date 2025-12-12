import { BulletApi, json, urlencoded } from './src/index.js';

const app = new BulletApi();

// Use JSON body parser middleware
app.use(json());

// Use URL-encoded body parser middleware
app.use(urlencoded());

// Test JSON body parsing
app.post('/api/users', (req, res) => {
    console.log('Request body:', req.body);
    res.status(201).json({
        message: 'User created',
        data: req.body
    });
});

// Test with URL-encoded data
app.post('/api/form', (req, res) => {
    console.log('Form data:', req.body);
    res.json({
        message: 'Form submitted',
        data: req.body
    });
});

// Test GET with query params
app.get('/api/search', (req, res) => {
    res.json({
        query: req.query,
        message: 'Search results'
    });
});

app.listen(3000);
