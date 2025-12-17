/**
 * Enhance the response object with helper methods
 * @param {Object} res - Node.js response object
 */
export const enhanceResponse = (res) => {
    // Store the status code
    res.statusCode = 200;

    /**
     * Set HTTP status code
     * @param {number} code - HTTP status code
     * @returns {Object} res - for chaining
     */
    res.status = function(code) {
        this.statusCode = code;
        return this;
    };

    /**
     * Send JSON response
     * @param {Object} data - Data to send as JSON
     */
    res.json = function(data) {
        this.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
        this.end(JSON.stringify(data));
    };

    /**
     * Send plain text or auto-detect content type
     * @param {string|Object|Buffer} body - Response body
     */
    res.send = function(body) {
        // Handle different types
        if (typeof body === 'string') {
            this.writeHead(this.statusCode, { 'Content-Type': 'text/html' });
            this.end(body);
        } else if (Buffer.isBuffer(body)) {
            this.writeHead(this.statusCode, { 'Content-Type': 'application/octet-stream' });
            this.end(body);
        } else if (typeof body === 'object') {
            this.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
            this.end(JSON.stringify(body));
        } else {
            this.writeHead(this.statusCode, { 'Content-Type': 'text/plain' });
            this.end(String(body));
        }
    };

    /**
     * Redirect to another URL
     * @param {string} url - URL to redirect to
     * @param {number} statusCode - HTTP status code (default: 302)
     */
    res.redirect = function(url, statusCode = 302) {
        this.writeHead(statusCode, { 'Location': url });
        this.end();
    };

    return res;
};
