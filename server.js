import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleUsersApi } from './server/userStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT || 4173)
const HOST = process.env.HOST || '0.0.0.0'

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
}

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath)] || 'application/octet-stream'
}

async function sendFile(response, filePath) {
  try {
    const fileStat = await stat(filePath)

    if (!fileStat.isFile()) {
      response.writeHead(404)
      response.end()
      return
    }

    response.writeHead(200, {
      'Content-Type': getContentType(filePath),
      'Cache-Control': filePath.includes(`${path.sep}assets${path.sep}`)
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
    })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404)
    response.end()
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`)

  if (requestUrl.pathname === '/api/users') {
    await handleUsersApi(request, response)
    return
  }

  const safePath = path
    .normalize(decodeURIComponent(requestUrl.pathname))
    .replace(/^(\.\.[/\\])+/, '')
  const requestedFile = path.join(
    DIST_DIR,
    safePath === path.sep ? 'index.html' : safePath,
  )

  try {
    const requestedStat = await stat(requestedFile)

    if (requestedStat.isFile()) {
      await sendFile(response, requestedFile)
      return
    }
  } catch {
    // Single-page app fallback below.
  }

  await sendFile(response, path.join(DIST_DIR, 'index.html'))
})

server.listen(PORT, HOST, () => {
  console.log(`MindUp app rodando em http://localhost:${PORT}`)
  console.log(`Storage das contas em ${path.join(__dirname, 'data', 'users.json')}`)
})
