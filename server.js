// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require('http');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const url = require('url');

const PORT = 5000;
const generatedCodes = new Set(); // Simple in-memory storage

const server = http.createServer((req, res) => {
    // Set CORS headers to allow requests from any origin (or specifically localhost:3000)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    
    if (req.method === 'GET' && parsedUrl.pathname === '/generate-code') {
        // Generate a random 4-digit code
        // Ensure it's 4 digits (1000-9999)
        const code = Math.floor(1000 + Math.random() * 9000);
        generatedCodes.add(code.toString());
        
        console.log(`Generated code: ${code}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            code: code
        }));
    } else if (req.method === 'POST' && parsedUrl.pathname === '/verify-code') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const codeToCheck = data.code ? data.code.toString() : '';

                if (generatedCodes.has(codeToCheck)) {
                    console.log(`Verified code: ${codeToCheck}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: "Code is valid"
                    }));
                } else {
                    console.log(`Failed verification for code: ${codeToCheck}`);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: "Invalid code"
                    }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: "Invalid JSON" }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
