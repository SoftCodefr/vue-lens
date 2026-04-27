import { collector } from '@softcodefr/vue-lens-core'

function djb2Hash(str: string): string {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

export function buildCallKey(method: string, url: string, body: string | null, gql: any): string {
  if (gql?.operationName) {
    // GQL : operationName + variables hash
    const varsHash = gql.variables ? djb2Hash(JSON.stringify(gql.variables)) : ''
    return `gql:${gql.operationName}:${varsHash}`
  }
  // REST : method + url + body hash
  const bodyHash = body ? djb2Hash(body) : ''
  return `${method}:${url}:${bodyHash}`
}

function parseGraphQL(body: string): {
  operationName: string | null
  operationType: 'query' | 'mutation' | 'subscription' | null
  variables?: Record<string, unknown>
} | null {
  try {
    const parsed = JSON.parse(body)
    if (!parsed.query) return null

    const operationName = parsed.operationName ?? null
    const match = parsed.query.trim().match(/^(query|mutation|subscription)/)
    const operationType = match ? match[1] as 'query' | 'mutation' | 'subscription' : 'query'
    const variables = parsed.variables ?? undefined

    return { operationName, operationType, variables }
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
    const callKey = buildCallKey(method, url, body, gql)
  
    collector.emit({
      type: 'network',
      method,
      url,
      status: response.status,
      duration,
      callKey,
      ...(gql ? { gql } : {}),
      ts
    })
  
    return response
  }
}