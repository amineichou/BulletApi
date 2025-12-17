import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * CORS middleware shortcut
 * @param {Object} options - CORS options
 * @returns {Function} Middleware function
 */
export const cors = (options = {}) => {
    const {
        origin = '*',
        methods = 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders = '*',
        credentials = false,
        maxAge = 86400
    } = options;

    return (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', methods);
        res.setHeader('Access-Control-Allow-Headers', allowedHeaders);
        
        if (credentials) {
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Max-Age', maxAge);
            res.writeHead(204);
            res.end();
            return;
        }
        
        next();
    };
};

/**
 * Request logger middleware shortcut
 * @param {Object} options - Logger options
 * @returns {Function} Middleware function
 */
export const logger = (options = {}) => {
    const { format = 'short' } = options;

    return (req, res, next) => {
        const start = Date.now();
        const timestamp = new Date().toISOString();

        // Store original end function
        const originalEnd = res.end;

        // Override end to log after response is sent
        res.end = function(...args) {
            const duration = Date.now() - start;
            
            if (format === 'short') {
                console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
            } else if (format === 'detailed') {
                console.log(`[${timestamp}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms - ${req.headers['user-agent'] || 'Unknown'}`);
            }

            originalEnd.apply(res, args);
        };

        next();
    };
};

/**
 * Static file server middleware shortcut
 * @param {string} directory - Directory to serve files from
 * @param {Object} options - Static file options
 * @returns {Function} Middleware function
 */
export const staticFiles = (directory, options = {}) => {
    const { index = 'index.html', dotfiles = 'ignore' } = options;

    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain',
        '.pdf': 'application/pdf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
    };

    return (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
        }

        let filePath = join(directory, req.pathname || req.url.split('?')[0]);

        // Check for dotfiles
        if (dotfiles === 'ignore' && filePath.includes('/.')) {
            return next();
        }

        try {
            if (existsSync(filePath)) {
                const stat = statSync(filePath);

                // If directory, try to serve index file
                if (stat.isDirectory()) {
                    filePath = join(filePath, index);
                    if (!existsSync(filePath)) {
                        return next();
                    }
                }

                const ext = extname(filePath);
                const contentType = mimeTypes[ext] || 'application/octet-stream';
                const content = readFileSync(filePath);

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            } else {
                next();
            }
        } catch (error) {
            next();
        }
    };
};

/**
 * Rate limiter middleware shortcut
 * @param {Object} options - Rate limiter options
 * @returns {Function} Middleware function
 */
export const rateLimit = (options = {}) => {
    const {
        windowMs = 60000, // 1 minute
        max = 100, // max requests per window
        message = 'Too many requests, please try again later.'
    } = options;

    const requests = new Map();

    // Clean up old entries periodically
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of requests.entries()) {
            if (now - data.resetTime > windowMs) {
                requests.delete(key);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const key = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const now = Date.now();
        const record = requests.get(key);

        if (!record) {
            requests.set(key, {
                count: 1,
                resetTime: now
            });
            return next();
        }

        if (now - record.resetTime > windowMs) {
            record.count = 1;
            record.resetTime = now;
            return next();
        }

        if (record.count >= max) {
            res.status(429).json({ error: message });
            return;
        }

        record.count++;
        next();
    };
};

/**
 * Basic authentication middleware shortcut
 * @param {Object} options - Auth options
 * @returns {Function} Middleware function
 */
export const basicAuth = (options = {}) => {
    const { username, password, realm = 'Secure Area' } = options;

    if (!username || !password) {
        throw new Error('Username and password are required for basicAuth');
    }

    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
        const [user, pass] = credentials.split(':');

        if (user === username && pass === password) {
            next();
        } else {
            res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    };
};

/**
 * Request timeout middleware shortcut
 * @param {number} ms - Timeout in milliseconds
 * @returns {Function} Middleware function
 */
export const timeout = (ms = 30000) => {
    return (req, res, next) => {
        const timer = setTimeout(() => {
            if (!res.writableEnded) {
                res.status(408).json({ error: 'Request timeout' });
            }
        }, ms);

        // Store original end function
        const originalEnd = res.end;
        res.end = function(...args) {
            clearTimeout(timer);
            originalEnd.apply(res, args);
        };

        next();
    };
};

/**
 * Request size limiter middleware shortcut
 * @param {Object} options - Size limit options
 * @returns {Function} Middleware function
 */
export const sizeLimit = (options = {}) => {
    const { max = 1048576 } = options; // 1MB default

    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);

        if (contentLength > max) {
            res.status(413).json({ error: 'Request entity too large' });
            return;
        }

        next();
    };
};
