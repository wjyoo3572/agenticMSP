'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const port = Number.parseInt(process.env.PORT || '8080', 10);
const publicDirectory = path.join(__dirname, 'public');
const catalogPath = process.env.AGENT_CATALOG_PATH || path.join(__dirname, '..', '..', 'agents', 'catalog.json');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function setSecurityHeaders(response) {
  response.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'");
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
}

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, { 'Content-Type': contentTypes['.json'] });
  response.end(JSON.stringify(value));
}

async function serveStatic(response, requestedPath) {
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '');
  const resolvedPath = path.resolve(publicDirectory, relativePath);

  if (!resolvedPath.startsWith(`${path.resolve(publicDirectory)}${path.sep}`)) {
    sendJson(response, 400, { error: 'invalid_path' });
    return;
  }

  try {
    const content = await fs.readFile(resolvedPath);
    response.writeHead(200, {
      'Cache-Control': relativePath === 'index.html' ? 'no-cache' : 'public, max-age=3600',
      'Content-Type': contentTypes[path.extname(resolvedPath)] || 'application/octet-stream'
    });
    response.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendJson(response, 404, { error: 'not_found' });
      return;
    }
    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  setSecurityHeaders(response);
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  try {
    if (url.pathname === '/health' || url.pathname === '/ready') {
      sendJson(response, 200, { status: 'ok', service: 'agenticmsp-portal' });
      return;
    }

    if (url.pathname === '/api/agents') {
      const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
      sendJson(response, 200, catalog);
      return;
    }

    await serveStatic(response, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'internal_error' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`AgenticMSP portal listening on 0.0.0.0:${port}`);
});
