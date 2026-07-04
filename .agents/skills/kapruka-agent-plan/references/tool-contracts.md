# MCP Tool Contracts (Strict Schemas)

All tools are auto-discovered from the Kapruka MCP server via `mcpClient.tools()`. This documents the expected contract for each.

## Tool 1: `kapruka_search_products`

Search the catalog by keyword with filters and pagination.

| Field | Type | Required | Example | Notes |
|---|---|---|---|---|
| `q` | `string` | ✅ | `"birthday cake"` | Search keyword |
| `category` | `string` | ❌ | `"Cakes"` | Must match value from `kapruka_list_categories` |
| `min_price` | `number` | ❌ | `500` | In LKR (or specified currency) |
| `max_price` | `number` | ❌ | `5000` | In LKR (or specified currency) |
| `in_stock_only` | `boolean` | ❌ | `true` | Filter to available items only |
| `sort` | `string` | ❌ | `"price_asc"` | Sort order |
| `limit` | `number` | ❌ | `10` | Results per page |
| `cursor` | `string` | ❌ | `"page2_token"` | Pagination, max 3 pages |
| `currency` | `string` | ❌ | `"LKR"` | Currency code |

**Returns:** Array of products with `id`, `name`, `price`, `image_url`, `url`, `in_stock`.

## Tool 2: `kapruka_get_product`

Full details for any product by ID.

| Field | Type | Required | Example |
|---|---|---|---|
| `product_id` | `string` | ✅ | `"11606"` |
| `currency` | `string` | ❌ | `"LKR"` |

**Returns:** Name, description, price, variants, images[], shipping info, direct URL.

## Tool 3: `kapruka_list_categories`

Top-level category names with browse URLs.

| Field | Type | Required | Example |
|---|---|---|---|
| `depth` | `number` | ❌ | `1` |

**Returns:** Array of `{name, url}` category objects.

## Tool 4: `kapruka_list_delivery_cities`

Search Kapruka's delivery network by city name or alias.

| Field | Type | Required | Example |
|---|---|---|---|
| `query` | `string` | ✅ | `"Kandy"` |
| `limit` | `number` | ❌ | `10` |

**Returns:** Up to 50 city matches with canonical names.

## Tool 5: `kapruka_check_delivery`

Check delivery availability, cost, and perishable warnings.

| Field | Type | Required | Example |
|---|---|---|---|
| `city` | `string` | ✅ | `"Kandy"` |
| `delivery_date` | `string` | ✅ | `"2026-07-06"` |
| `product_id` | `string` | ✅ | `"11606"` |

**Returns:** `{deliverable: bool, rate: number, perishable_warning: string?}`.

## Tool 6: `kapruka_create_order`

Create a guest-checkout order → returns click-to-pay URL.

| Field | Type | Required | Example |
|---|---|---|---|
| `cart` | `array` | ✅ | `[{product_id: "11606", qty: 1}]` |
| `recipient` | `object` | ✅ | `{name: "Nimal", phone: "0771234567", address: "123 Temple Rd", city: "Kandy"}` |
| `delivery` | `object` | ✅ | `{date: "2026-07-06"}` |
| `sender` | `object` | ✅ | `{name: "Kumari", email: "kumari@example.com", phone: "0777654321"}` |
| `gift_message` | `string` | ❌ | `"Happy Birthday! 🎂"` |
| `currency` | `string` | ❌ | `"LKR"` |

**Returns:** `{order_number, pay_url, total, expires_in_minutes: 60}`.

**CRITICAL:** Never call this tool without explicit user confirmation via UI button.

## Tool 7: `kapruka_track_order`

Look up status and delivery progress for any order.

| Field | Type | Required | Example |
|---|---|---|---|
| `order_number` | `string` | ✅ | `"KAP-2026-12345"` |

**Returns:** Order status, items, recipient, timestamped delivery timeline.

## Schema Validation Strategy

- MCP tools are auto-discovered with schemas → AI SDK validates params before calling
- System prompt includes explicit usage examples for each tool
- `maxSteps` loop auto-feeds error responses back for self-correction
