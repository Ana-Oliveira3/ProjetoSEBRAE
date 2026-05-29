import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const MAX_BODY_SIZE = 2 * 1024 * 1024

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function readStoredUsers() {
  try {
    const content = await readFile(USERS_FILE, 'utf8')
    const payload = JSON.parse(content)

    return Array.isArray(payload.users) ? payload.users : []
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

export async function writeStoredUsers(users) {
  if (!Array.isArray(users)) {
    throw new TypeError('Users payload must be an array.')
  }

  await ensureDataDir()

  const payload = JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      users,
    },
    null,
    2,
  )
  const tempFile = `${USERS_FILE}.tmp`

  await writeFile(tempFile, payload, 'utf8')
  await rename(tempFile, USERS_FILE)
}

async function readBody(request) {
  let body = ''

  for await (const chunk of request) {
    body += chunk

    if (body.length > MAX_BODY_SIZE) {
      const error = new Error('Payload too large.')
      error.statusCode = 413
      throw error
    }
  }

  return body ? JSON.parse(body) : {}
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(payload))
}

export async function handleUsersApi(request, response) {
  try {
    if (request.method === 'GET') {
      const users = await readStoredUsers()
      sendJson(response, 200, { users })
      return
    }

    if (request.method === 'PUT') {
      const payload = await readBody(request)
      const users = Array.isArray(payload.users) ? payload.users : null

      if (!users) {
        sendJson(response, 400, { error: 'Invalid users payload.' })
        return
      }

      await writeStoredUsers(users)
      sendJson(response, 200, { ok: true, users })
      return
    }

    response.writeHead(405, {
      Allow: 'GET, PUT',
      'Cache-Control': 'no-store',
    })
    response.end()
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error.statusCode ? error.message : 'Storage error.',
    })
  }
}
