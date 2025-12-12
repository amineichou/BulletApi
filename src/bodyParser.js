/**
 * Parse JSON body from request
 * @param {Object} req - Node.js request object
 * @param {number} limit - Maximum body size in bytes
 * @returns {Promise<Object>} - Parsed JSON body
 */
const parseJSON = (req, limit) => {
    return new Promise((resolve, reject) => {
        let body = '';
        let bytesReceived = 0;
        let limitExceeded = false;
        let alreadyResolved = false;
        
        req.on('data', (chunk) => {
            if (limitExceeded || alreadyResolved) return;
            
            bytesReceived += chunk.length;
            
            if (bytesReceived > limit) {
                limitExceeded = true;
                alreadyResolved = true;
                
                // Reject immediately
                reject(new Error('Payload Too Large'));
                
                // Clean up listeners and drain remaining data
                req.removeAllListeners('data');
                req.removeAllListeners('end');
                req.removeAllListeners('error');
                req.resume();
                return;
            }
            body += chunk.toString();
        });
        
        req.on('end', () => {
            if (limitExceeded || alreadyResolved) return;
            alreadyResolved = true;
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
            if (limitExceeded || alreadyResolved) return;
            alreadyResolved = true;
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
            
            // Check content-length if provided (early rejection)
            if (req.headers['content-length']) {
                bodySize = parseInt(req.headers['content-length'], 10);
                
                if (bodySize > limit) {
                    res.writeHead(413, { 'Content-Type': 'text/plain' });
                    res.end('Payload Too Large');
                    return;
                }
            }
            
            try {
                req.body = await parseJSON(req, limit);
            } catch (error) {
                if (res.headersSent || res.writableEnded) {
                    return;
                }
                
                if (error.message === 'Payload Too Large') {
                    res.writeHead(413, { 'Content-Type': 'text/plain' });
                    res.end('Payload Too Large');
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Bad Request: Invalid JSON');
                }
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
            
            // Check content-length if provided (early rejection)
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
                let bytesReceived = 0;
                
                for await (const chunk of req) {
                    bytesReceived += chunk.length;
                    if (bytesReceived > limit) {
                        // Drain remaining data
                        req.resume();
                        throw new Error('Payload Too Large');
                    }
                    body += chunk.toString();
                }
                
                // Parse URL-encoded data
                const params = new URLSearchParams(body);
                req.body = Object.fromEntries(params);
            } catch (error) {
                if (error.message === 'Payload Too Large') {
                    res.writeHead(413, { 'Content-Type': 'text/plain' });
                    res.end('Payload Too Large');
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Bad Request: Invalid URL-encoded data');
                }
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
        
        // Check content-length if provided (early rejection)
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
            let bytesReceived = 0;
            
            for await (const chunk of req) {
                bytesReceived += chunk.length;
                if (bytesReceived > limit) {
                    // Drain remaining data
                    req.resume();
                    throw new Error('Payload Too Large');
                }
                chunks.push(chunk);
            }
            
            req.body = Buffer.concat(chunks);
        } catch (error) {
            if (error.message === 'Payload Too Large') {
                res.writeHead(413, { 'Content-Type': 'text/plain' });
                res.end('Payload Too Large');
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request');
            }
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
        
        // Check content-length if provided (early rejection)
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
            let bytesReceived = 0;
            
            for await (const chunk of req) {
                bytesReceived += chunk.length;
                if (bytesReceived > limit) {
                    // Drain remaining data
                    req.resume();
                    throw new Error('Payload Too Large');
                }
                body += chunk.toString();
            }
            
            req.body = body;
        } catch (error) {
            if (error.message === 'Payload Too Large') {
                res.writeHead(413, { 'Content-Type': 'text/plain' });
                res.end('Payload Too Large');
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request');
            }
            return;
        }
        
        next();
    };
};
