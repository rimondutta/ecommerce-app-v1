/**
 * RFC 4180 compliant CSV parser and generator for products import/export.
 */

export interface ParsedCsvProduct {
  title: string
  slug?: string
  price: number
  compareAtPrice?: number | null
  category?: string
  inventory: number
  description?: string
  longDescription?: string
  ageRange?: string
  badge?: string
  images: Array<{ url: string; alt?: string }>
  tags: string[]
  isPublished: boolean
}

export interface CsvParseResult {
  valid: ParsedCsvProduct[]
  errors: { row: number; error: string; raw?: Record<string, string> }[]
  totalRows: number
}

/**
 * Robust RFC 4180 CSV parser that properly handles:
 * - Quotes inside values (escaped as "")
 * - Commas within quotes
 * - Newline characters within quotes
 * - UTF-8 BOM (\uFEFF)
 * - Windows CRLF and Unix LF line endings
 */
export function parseCsvText(text: string): string[][] {
  // Strip BOM if present
  let cleanText = text.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let insideQuotes = false

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    const nextChar = cleanText[i + 1]

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: ""
          currentField += '"'
          i++ // skip next quote
        } else {
          // Closing quote
          insideQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        insideQuotes = true
      } else if (char === ',') {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if (char === '\r') {
        // Handle \r\n or \r
        if (nextChar === '\n') {
          i++
        }
        currentRow.push(currentField.trim())
        currentField = ''
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
      } else if (char === '\n') {
        currentRow.push(currentField.trim())
        currentField = ''
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
      } else {
        currentField += char
      }
    }
  }

  // Push final field / row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

/** Normalize header name to canonical key */
function normalizeHeader(h: string): string {
  const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (['title', 'name', 'productname', 'producttitle', 'itemname'].includes(clean)) return 'title'
  if (['price', 'saleprice', 'sellingprice', 'unitprice', 'cost'].includes(clean)) return 'price'
  if (['compareatprice', 'compareprice', 'originalprice', 'regularprice', 'mrp'].includes(clean)) return 'compareAtPrice'
  if (['category', 'categoryname', 'collection'].includes(clean)) return 'category'
  if (['inventory', 'stock', 'qty', 'quantity', 'available'].includes(clean)) return 'inventory'
  if (['description', 'shortdescription', 'summary'].includes(clean)) return 'description'
  if (['longdescription', 'details', 'fulldescription', 'body'].includes(clean)) return 'longDescription'
  if (['images', 'image', 'imageurl', 'imageurls', 'photos', 'picture'].includes(clean)) return 'images'
  if (['tags', 'tag', 'keywords'].includes(clean)) return 'tags'
  if (['badge', 'label', 'ribbon'].includes(clean)) return 'badge'
  if (['agerange', 'age', 'ages'].includes(clean)) return 'ageRange'
  if (['status', 'ispublished', 'published', 'active'].includes(clean)) return 'isPublished'
  if (['slug', 'handle', 'url'].includes(clean)) return 'slug'
  return clean
}

/**
 * Converts parsed raw CSV 2D array into validated product objects
 */
export function convertCsvToProducts(rows: string[][]): CsvParseResult {
  if (rows.length < 2) {
    return { valid: [], errors: [{ row: 1, error: 'CSV file is empty or has no header row' }], totalRows: 0 }
  }

  const rawHeaders = rows[0]
  const normalizedHeaders = rawHeaders.map(normalizeHeader)

  const valid: ParsedCsvProduct[] = []
  const errors: { row: number; error: string; raw?: Record<string, string> }[] = []

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const rowObj: Record<string, string> = {}
    normalizedHeaders.forEach((key, idx) => {
      rowObj[key] = row[idx] || ''
    })

    const title = (rowObj.title || '').trim()
    if (!title) {
      errors.push({ row: r + 1, error: 'Missing product title', raw: rowObj })
      continue
    }

    const priceRaw = (rowObj.price || '').replace(/[^0-9.]/g, '')
    const price = parseFloat(priceRaw)
    if (isNaN(price) || price < 0) {
      errors.push({ row: r + 1, error: `Invalid price "${rowObj.price}" for product "${title}"`, raw: rowObj })
      continue
    }

    let compareAtPrice: number | null = null
    if (rowObj.compareAtPrice) {
      const cmpVal = parseFloat(rowObj.compareAtPrice.replace(/[^0-9.]/g, ''))
      if (!isNaN(cmpVal) && cmpVal > 0) {
        compareAtPrice = cmpVal
      }
    }

    const inventoryRaw = parseInt((rowObj.inventory || '10').replace(/[^0-9]/g, ''), 10)
    const inventory = isNaN(inventoryRaw) ? 10 : inventoryRaw

    // Images can be separated by semicolon, pipe, or comma (if not in quotes)
    const imagesRaw = rowObj.images || ''
    const imageUrls = imagesRaw
      .split(/[;,|]/)
      .map(u => u.trim())
      .filter(u => u.startsWith('http') || u.startsWith('/'))
    const images = imageUrls.map(url => ({ url, alt: title }))

    // Tags separated by comma or semicolon
    const tagsRaw = rowObj.tags || ''
    const tags = tagsRaw
      .split(/[;,]/)
      .map(t => t.trim())
      .filter(Boolean)

    // isPublished
    let isPublished = true
    if (rowObj.isPublished) {
      const p = rowObj.isPublished.toLowerCase().trim()
      if (['false', '0', 'draft', 'no', 'inactive'].includes(p)) {
        isPublished = false
      }
    }

    const slug = (rowObj.slug || '').trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    valid.push({
      title,
      slug,
      price,
      compareAtPrice,
      category: (rowObj.category || '').trim() || undefined,
      inventory,
      description: (rowObj.description || '').trim() || undefined,
      longDescription: (rowObj.longDescription || '').trim() || undefined,
      ageRange: (rowObj.ageRange || '').trim() || undefined,
      badge: (rowObj.badge || '').trim() || undefined,
      images,
      tags,
      isPublished,
    })
  }

  return {
    valid,
    errors,
    totalRows: rows.length - 1,
  }
}

/**
 * Escape a single cell for CSV output according to RFC 4180
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Generate a downloadable sample CSV template with example toys/products
 */
export function generateSampleCsv(): string {
  const headers = [
    'Title',
    'Price',
    'Compare Price',
    'Category',
    'Inventory',
    'Description',
    'Long Description',
    'Age Range',
    'Badge',
    'Images',
    'Tags',
    'Status',
  ]

  const sampleRows = [
    [
      'Electric Little Duck Climbing Stairs Toy',
      '850',
      '1200',
      'Electric Toys',
      '50',
      'Fun electric duck climbing slide toy with music and lights',
      'Full features: automatic staircase climbing, smooth slide tracks, colorful LED lights, happy nursery rhyme music. Safe ABS plastic, rounded edges.',
      '3-6',
      'Best Seller',
      'https://res.cloudinary.com/dciffpt3t/image/upload/v1786034854/products/vl7qe1kv0chr6oxvnafy.jpg',
      'duck, electric, light, music, toy',
      'Active',
    ],
    [
      'Magnetic Building Blocks 64 Pcs Set',
      '1450',
      '1800',
      'Educational',
      '30',
      'Creative 3D magnetic building tiles puzzle set',
      'Enhance child creativity, spatial reasoning and STEM skills with strong neodymium magnets and safe food-grade plastic tiles.',
      '4-10',
      'New',
      'https://res.cloudinary.com/dciffpt3t/image/upload/v1786034854/products/vl7qe1kv0chr6oxvnafy.jpg',
      'stem, magnetic, building, blocks',
      'Active',
    ],
    [
      'Remote Control Stunt Car 360 Rotation',
      '1250',
      '1600',
      'RC Vehicles',
      '20',
      'High-speed double sided 360 stunt flip RC car',
      'Durable stunt vehicle with 2.4GHz remote control, double-sided running, 360 degree flips, rechargeable battery included.',
      '6+',
      'Hot',
      'https://res.cloudinary.com/dciffpt3t/image/upload/v1786034854/products/vl7qe1kv0chr6oxvnafy.jpg',
      'rc, car, stunt, vehicle',
      'Active',
    ],
  ]

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...sampleRows.map(row => row.map(escapeCsvCell).join(',')),
  ]

  return csvLines.join('\r\n')
}

/**
 * Generate full CSV export of existing products
 */
export function generateProductsCsv(products: Array<Record<string, unknown>>): string {
  const headers = [
    'Title',
    'Slug',
    'Price',
    'Compare Price',
    'Category',
    'Inventory',
    'Description',
    'Age Range',
    'Badge',
    'Images',
    'Tags',
    'Status',
  ]

  const rows = products.map(p => {
    const categoryName = typeof p.category === 'object' && p.category && 'name' in p.category
      ? (p.category as { name?: string }).name || ''
      : ''

    const imagesStr = Array.isArray(p.images)
      ? p.images.map(img => (typeof img === 'object' && img?.url ? img.url : String(img))).join(';')
      : ''

    const tagsStr = Array.isArray(p.tags) ? p.tags.join(', ') : ''

    return [
      escapeCsvCell(p.title || ''),
      escapeCsvCell(p.slug || ''),
      escapeCsvCell(p.price ?? 0),
      escapeCsvCell(p.compareAtPrice || ''),
      escapeCsvCell(categoryName),
      escapeCsvCell(p.inventory ?? 0),
      escapeCsvCell(p.description || ''),
      escapeCsvCell(p.ageRange || ''),
      escapeCsvCell(p.badge || ''),
      escapeCsvCell(imagesStr),
      escapeCsvCell(tagsStr),
      escapeCsvCell(p.isPublished ? 'Active' : 'Draft'),
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\r\n')
}

