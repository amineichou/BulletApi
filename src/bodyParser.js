/**
 * Parse JSON body from request
 * @param {Object} req - Node.js request object
 * @returns {Promise<Object>} - Parsed JSON body
 */
const parseJSON = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                if (body.length === 0) {
                    resolve({});
                } else {
                    resolve(JSON.parse(body));
                }
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
        
        req.on('error', (error) => {
            reject(error);
        });
    });
};

/**
 * JSON body parser middleware
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Maximum body size in bytes (default: 1mb)
 * @returns {Function} - Middleware function
 */
export const json = (options = {}) => {
    const limit = options.limit || 1024 * 1024; // 1MB default
    
    return async (req, res, next) => {
        // Skip if body already parsed
        if (req.body !== undefined) {
            next();
            return;
        }
        
        const contentType = req.headers['content-type'];
        
        // Only parse if content-type is application/json
        if (contentType && contentType.includes('application/json')) {
            let bodySize = 0;
            
            // Check content-length if provided
            if (req.headers['content-length']) {
                bodySize = parseInt(req.headers['content-length'], 10);
                
                if (bodySize > limit) {
                    res.writeHead(413, { 'Content-Type': 'text/plain' });
                    res.end('Payload Too Large');
                    return;
                }
            }
            
            try {
                req.body = await parseJSON(req);
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request: Invalid JSON');
                return;
            }
        }
        
        next();
    };
};

/**
 * URL-encoded body parser middleware
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Maximum body size in bytes (default: 1mb)
 * @returns {Function} - Middleware function
 */
export const urlencoded = (options = {}) => {
    const limit = options.limit || 1024 * 1024; // 1MB default
    
    return async (req, res, next) => {
        // Skip if body already parsed
        if (req.body !== undefined) {
            next();
            return;
        }
        
        const contentType = req.headers['content-type'];
        
        // Only parse if content-type is application/x-www-form-urlencoded
        if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
            let bodySize = 0;
            
            // Check content-length if provided
            if (req.headers['content-length']) {
                bodySize = parseInt(req.headers['content-length'], 10);
                
                if (bodySize > limit) {
                    res.writeHead(413, { 'Content-Type': 'text/plain' });
                    res.end('Payload Too Large');
                    return;
                }
            }
            
            try {
                let body = '';
                
                for await (const chunk of req) {
                    body += chunk.toString();
                }
                
                // Parse URL-encoded data
                const params = new URLSearchParams(body);
                req.body = Object.fromEntries(params);
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request: Invalid URL-encoded data');
                return;
            }
        }
        
        next();
    };
};

/**
 * Raw body parser middleware
 * Returns body as Buffer
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Maximum body size in bytes (default: 1mb)
 * @returns {Function} - Middleware function
 */
export const raw = (options = {}) => {
    const limit = options.limit || 1024 * 1024; // 1MB default
    
    return async (req, res, next) => {
        let bodySize = 0;
        
        // Check content-length if provided
        if (req.headers['content-length']) {
            bodySize = parseInt(req.headers['content-length'], 10);
            
            if (bodySize > limit) {
                res.writeHead(413, { 'Content-Type': 'text/plain' });
                res.end('Payload Too Large');
                return;
            }
        }
        
        try {
            const chunks = [];
            
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            
            req.body = Buffer.concat(chunks);
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad Request');
            return;
        }
        
        next();
    };
};

/**
 * Text body parser middleware
 * Returns body as string
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Maximum body size in bytes (default: 1mb)
 * @returns {Function} - Middleware function
 */
export const text = (options = {}) => {
    const limit = options.limit || 1024 * 1024; // 1MB default
    
    return async (req, res, next) => {
        let bodySize = 0;
        
        // Check content-length if provided
        if (req.headers['content-length']) {
            bodySize = parseInt(req.headers['content-length'], 10);
            
            if (bodySize > limit) {
                res.writeHead(413, { 'Content-Type': 'text/plain' });
                res.end('Payload Too Large');
                return;
            }
        }
        
        try {
            let body = '';
            
            for await (const chunk of req) {
                body += chunk.toString();
            }
            
            req.body = body;
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad Request');
            return;
        }
        
        next();
    };
};
