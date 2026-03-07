// Lê um parâmetro de query string e converte os valores "true"/"false" para boolean
export function getSearchParam(name: string, url?: string): string | boolean | null {
  const searchStr = url ? new URL(url).search : window.location.search
  const params = new URLSearchParams(searchStr)
  const value = params.get(name)

  if (value === null) return null
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}
