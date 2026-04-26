import { collector } from '@softcodefr/vue-lens-core'

function parseGraphQL(body: string): { operationName: string | null, operationType: 'query' | 'mutation' | 'subscription' | null } | null {
  try {
    const parsed = JSON.parse(body)
    if (!parsed.query) return null

    const operationName = parsed.operationName ?? null
    const match = parsed.query.trim().match(/^(query|mutation|subscription)/)
    const operationType = match ? match[1] as 'query' | 'mutation' | 'subscription' : 'query'

    return { operationName, operationType }
  } catch {
    return null
  }
}

function isGraphQL(url: string, body: string | null): boolean {
  if (url.includes('/graphql')) return true
  if (!body) return false
  try {
    const parsed = JSON.parse(body)
    return typeof parsed.query === 'string'
  } catch {
    return false
  }
}

export function setupNetwork() {
  const originalFetch = window.fetch

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = init?.method?.toUpperCase() ?? 'GET'
    const body = typeof init?.body === 'string' ? init.body : null
    const ts = Date.now()

    const response = await originalFetch(input, init)
    const duration = Date.now() - ts

    const gql = isGraphQL(url, body) && body ? parseGraphQL(body) : null

    collector.emit({
      type: 'network',
      method,
      url,
      status: response.status,
      duration,
      ...(gql ? { gql } : {}),
      ts
    })

    return response
  }
}