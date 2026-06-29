'use server'

export async function increment(formData) {
  const count = parseInt(formData.get('count') || '0', 10)
  return { count: count + 1 }
}
