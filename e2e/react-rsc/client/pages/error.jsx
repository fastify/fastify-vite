export const rsc = true

export default async function ErrorPage() {
  throw new Error('RSC Server Error - intentional for testing')
}
