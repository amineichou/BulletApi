import { createServer } from 'http';
import { middlewarePipeline } from './middleware.js';
import { enhanceResponse } from './response.js';

// Convert route pattern like /users/:id to regex
const pathToRegex = (path) => {
    const pattern = path
        .replace(/\//g, '\\/')  // Escape slashes
        .replace(/:(\w+)/g, '(?<$1>[^/]+)');  // Convert :param to named capture group
    return new RegExp(`^${pattern}$`);
};

// Check if a path has dynamic parameters
const isDynamicPath = (path) => {
    return path.includes(':');
};

// Extract params from a matched route
const extractParams = (pathname, routePath) => {
    const regex = pathToRegex(routePath);
    const match = pathname.match(regex);
    return match ? match.groups || {} : {};
};

const parseHandlers = (handlers) => {
    handlers.forEach(handler => {
        // make sure handlers are functions
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }

        // make sure handlers have 2 or 3 parameters
        if (handler.length !== 2 && handler.length !== 3) {
            throw new Error('Handler must have 2 or 3 parameters: (req, res, next) or (req, res)');
        }
    });
}

export class BulletApi {
    #middlewares = [];
    #routes = [];

    constructor() {
        this.server = createServer((req, res) => {
            this.handleRequest(req, res);
        });
    }

    listen(port) {
        this.server.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    }

    use(middleware) {
        // check if middleware is a function
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        // check if middleware has 2 or 3 parameters
        if (middleware.length !== 2 && middleware.length !== 3) {
            throw new Error('Middleware must have 2 or 3 parameters: (req, res, next) or (req, res)');
        }
        this.#middlewares.push(middleware);
    }

    get(path, ...handlers) {
        parseHandlers(handlers);
        this.#routes.push({ method: 'GET', path, handlers });
    }

    post(path, ...handlers) {
        parseHandlers(handlers);
        this.#routes.push({ method: 'POST', path, handlers });
    }

    put(path, ...handlers) {
        parseHandlers(handlers);
        this.#routes.push({ method: 'PUT', path, handlers });
    }

    delete(path, ...handlers) {
        parseHandlers(handlers);
        this.#routes.push({ method: 'DELETE', path, handlers });
    }

    head(path, ...handlers) {
        parseHandlers(handlers);
        this.#routes.push({ method: 'HEAD', path, handlers });
    }

    options(path, ...handlers) {
        parseHandlers(handlers);
        this.#routes.push({ method: 'OPTIONS', path, handlers });
    }

    // Shortcut: Quick start server with default settings
    quickStart(port = 3000, callback) {
        this.listen(port, callback);
        return this;
    }

    // Shortcut: Allow access to route based on condition
    allow(condition, message = 'Access denied') {
        return (req, res, next) => {
            const allowed = typeof condition === 'function' ? condition(req) : condition;
            if (allowed) {
                next();
            } else {
                res.status(403).json({ error: message });
            }
        };
    }

    // Shortcut: Ban access to route based on condition
    ban(condition, message = 'Access forbidden') {
        return (req, res, next) => {
            const banned = typeof condition === 'function' ? condition(req) : condition;
            if (!banned) {
                next();
            } else {
                res.status(403).json({ error: message });
            }
        };
    }

    // Shortcut: Quick redirect
    redirect(from, to, statusCode = 302) {
        this.get(from, (req, res) => {
            res.redirect(to, statusCode);
        });
        return this;
    }

    // Shortcut: Apply middleware to all routes
    global(middleware) {
        this.use(middleware);
        return this;
    }

    // Shortcut: Group routes with common prefix
    group(prefix, callback) {
        const originalMethods = {
            get: this.get.bind(this),
            post: this.post.bind(this),
            put: this.put.bind(this),
            delete: this.delete.bind(this),
            head: this.head.bind(this),
            options: this.options.bind(this)
        };

        // Create temporary methods that prepend the prefix
        const tempRouter = {};
        Object.keys(originalMethods).forEach(method => {
            tempRouter[method] = (path, ...handlers) => {
                originalMethods[method](prefix + path, ...handlers);
            };
        });

        callback(tempRouter);
        return this;
    }

    handleRequest(req, res) {
        // Parse URL to handle query strings properly
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;
        
        // Try to find matching route (exact match or pattern match)
        let route = null;
        let params = {};
        
        for (const r of this.#routes) {
            if (r.method !== req.method) continue;
            
            // Try exact match first
            if (r.path === pathname) {
                route = r;
                break;
            }
            
            // Try dynamic route match
            if (isDynamicPath(r.path)) {
                const regex = pathToRegex(r.path);
                if (regex.test(pathname)) {
                    route = r;
                    params = extractParams(pathname, r.path);
                    break;
                }
            }
        }
        
        if (route) {
            // Enhance response object with helper methods
            enhanceResponse(res);
            
            // Attach parsed URL for handlers to use
            req.query = Object.fromEntries(url.searchParams);
            req.pathname = pathname;
            req.params = params;
            
            const allHandlers = [...this.#middlewares, ...route.handlers];
            middlewarePipeline(req, res, allHandlers);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found\n');
        }
    }
}