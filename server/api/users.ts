import { defineEventHandler, readBody } from 'h3'

interface User {
  id: number
  name: string
  email: string
}

let users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
]

export default defineEventHandler(async (event) => {
  const method = event.node.req.method || 'GET'
  const url = new URL(event.node.req.url || '/', 'http://localhost')
  const id = url.searchParams.get('id')

  if (method === 'GET') {
    return users
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
    const newUser: User = { id: nextId, ...(body as any) }
    users.push(newUser)
    return { success: true, data: newUser }
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const updated = body as User
    users = users.map((u) => (u.id === updated.id ? updated : u))
    return { success: true, data: updated }
  }

  if (method === 'DELETE') {
    if (!id) return { success: false, message: 'missing id' }
    const nid = Number(id)
    users = users.filter((u) => u.id !== nid)
    return { success: true }
  }

  return { success: false, message: 'unsupported method' }
})
