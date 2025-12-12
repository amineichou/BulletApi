import { BulletApi } from "./src/bulletapi.js";


const app = new BulletApi();

// Async middleware - logs all requests
app.use(async (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Simple handler
app.get('/sayhi', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
});

// Async handler
app.get('/async', async (req, res) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    const data = { message: 'Async response', timestamp: Date.now() };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
});

// Dynamic route with params
app.get('/users/:id', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        userId: req.params.id,
        message: `User ${req.params.id} found` 
    }));
});

// Multiple params
app.get('/posts/:postId/comments/:commentId', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        postId: req.params.postId,
        commentId: req.params.commentId 
    }));
});

// Test response helpers
app.get('/api/users', (req, res) => {
    res.json({ users: ['Alice', 'Bob', 'Charlie'] });
});

app.get('/api/status', (req, res) => {
    res.status(201).json({ message: 'Created successfully' });
});

app.get('/text', (req, res) => {
    res.send('Hello from res.send()');
});

app.get('/html', (req, res) => {
    res.send('<h1>HTML Response</h1>');
});

app.get('/error', (req, res) => {
    res.status(500).json({ error: 'Something went wrong' });
});

app.listen(3000);