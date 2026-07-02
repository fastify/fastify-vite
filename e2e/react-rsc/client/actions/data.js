'use server'

export async function getServerData() {
  return { message: 'Hello from server action!', timestamp: new Date().toISOString() }
}
