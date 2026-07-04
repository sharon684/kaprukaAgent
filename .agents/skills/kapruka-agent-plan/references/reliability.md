# Reliability Engineering

## Retry Logic

All external calls must be wrapped with retry:

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,        // 1s, 2s, 4s exponential backoff
  maxDelayMs: 8000,
  retryableStatuses: [429, 500, 502, 503, 504],
};

async function withRetry<T>(fn: () => Promise<T>, config = RETRY_CONFIG): Promise<T> {
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable =
        ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT'].includes(error.code) ||
        config.retryableStatuses.includes(error.status);
      if (!isRetryable || attempt === config.maxRetries) throw error;
      const delay = Math.min(config.baseDelayMs * 2 ** attempt, config.maxDelayMs);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}
```

## Timeouts

| Component | Timeout | Rationale |
|---|---|---|
| MCP Client connection | 10s | Connection should be fast |
| MCP Tool execution | 15s | Complex queries may take time |
| Gemini API (per step) | 30s | Allow for longer reasoning |
| Overall request | 55s | Vercel serverless max is 60s |
| Order creation | 20s | Critical path — give extra time |

## Fallback Paths

| Primary Action | Fallback |
|---|---|
| MCP tool fails | Return error to Gemini → model explains issue naturally |
| Search returns 0 results | Model suggests alternative terms or category browsing |
| Delivery not available | Model suggests alternative dates or nearby cities |
| Order creation fails | Show error details, suggest retry or visit kapruka.com |
| Gemini API down | Static fallback message with link to kapruka.com |

## Circuit Breaker

```typescript
interface CircuitBreaker {
  failureCount: number;
  failureThreshold: number;  // Open after 5 consecutive failures
  resetTimeMs: number;       // Try again after 1 minute
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  lastFailureTime: number;
}

function shouldAllowRequest(cb: CircuitBreaker): boolean {
  if (cb.state === 'CLOSED') return true;
  if (cb.state === 'OPEN') {
    if (Date.now() - cb.lastFailureTime >= cb.resetTimeMs) {
      cb.state = 'HALF_OPEN';
      return true; // Allow one test request
    }
    return false;
  }
  return true; // HALF_OPEN allows one request
}
```

When circuit is OPEN: immediately return a friendly error without hitting the MCP server.
