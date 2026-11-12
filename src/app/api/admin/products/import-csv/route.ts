import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import Product from '@/models/Product'
import Category from '@/models/Category'
import { touchProductsTimestamp } from '@/lib/lastUpdated'
import { generateSampleCsv, parseCsvText, convertCsvToProducts, ParsedCsvProduct } from '@/lib/csvHelper'

// GET: Download sample CSV template
export async function GET() {
  try {
    const csv = generateSampleCsv()
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products_sample_template.csv"',
      },
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate template' },
      { status: 500 }
    )
  }
}

// Helper to sanitize slug
function generateUniqueSlug(base: string, index: number): string {
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (!clean) return `product-${Date.now()}-${index}`
  return clean
}

// POST: Import products from CSV (either raw text or parsed array)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'manager'].includes((session.user as { role?: string })?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    let productsToImport: ParsedCsvProduct[] = []
    let updateExisting = false

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      productsToImport = body.products || []
      updateExisting = Boolean(body.updateExisting)
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      updateExisting = formData.get('updateExisting') === 'true'

      if (!file) {
        return NextResponse.json({ error: 'No CSV file uploaded' }, { status: 400 })
      }

      const text = await file.text()
      const rows = parseCsvText(text)
      const parseResult = convertCsvToProducts(rows)

      if (parseResult.errors.length > 0 && parseResult.valid.length === 0) {
        return NextResponse.json(
          {
            error: 'CSV contains errors and no valid products could be found',
            errors: parseResult.errors,
          },
          { status: 400 }
        )
      }

      productsToImport = parseResult.valid
    } else {
      // Raw CSV text
      const text = await req.text()
      const rows = parseCsvText(text)
      const parseResult = convertCsvToProducts(rows)
      productsToImport = parseResult.valid
    }

    if (!productsToImport.length) {
      return NextResponse.json({ error: 'No valid products to import' }, { status: 400 })
    }

    // 1. Pre-load all categories to map by name / slug
    const allCategories = await Category.find({}).lean()
    const categoryMap = new Map<string, string>() // lowercase name -> _id
    allCategories.forEach((cat: { _id: { toString(): string }; name: string; slug: string }) => {
      categoryMap.set(cat.name.toLowerCase().trim(), cat._id.toString())
      if (cat.slug) categoryMap.set(cat.slug.toLowerCase().trim(), cat._id.toString())
    })

    // 2. Automatically create missing categories if specified
    const missingCategoryNames = new Set<string>()
    for (const p of productsToImport) {
      if (p.category) {
        const lower = p.category.toLowerCase().trim()
        if (!categoryMap.has(lower)) {
          missingCategoryNames.add(p.category.trim())
        }
      }
    }

    for (const catName of missingCategoryNames) {
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      try {
        const newCat = await Category.create({
          name: catName,
          slug: catSlug || `category-${Date.now()}`,
          isActive: true,
        })
        categoryMap.set(catName.toLowerCase().trim(), newCat._id.toString())
      } catch {
        // If conflict, try fetching again
        const existing = await Category.findOne({ name: catName }).lean()
        if (existing) {
          categoryMap.set(catName.toLowerCase().trim(), (existing as { _id: { toString(): string } })._id.toString())
        }
      }
    }

    // 3. Process products: insert or update
    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0
    const errors: { row: number; title: string; error: string }[] = []

    for (let i = 0; i < productsToImport.length; i++) {
      const p = productsToImport[i]
      const rowNum = i + 1

      try {
        const baseSlug = p.slug || generateUniqueSlug(p.title, i)
        const categoryId = p.category ? categoryMap.get(p.category.toLowerCase().trim()) : undefined

        // Sanitize image URLs
        const validImages = (p.images || []).filter(
          img => img?.url && (img.url.startsWith('http') || img.url.startsWith('/'))
        )

        // Check if product with this slug already exists
        const existingProduct = await Product.findOne({ slug: baseSlug })

        if (existingProduct) {
          if (updateExisting) {
            existingProduct.title = p.title
            existingProduct.price = p.price
            if (p.compareAtPrice !== undefined) existingProduct.compareAtPrice = p.compareAtPrice
            if (categoryId) existingProduct.category = categoryId
            existingProduct.inventory = p.inventory
            if (p.description) existingProduct.description = p.description
            if (p.longDescription) existingProduct.longDescription = p.longDescription
            if (p.ageRange) existingProduct.ageRange = p.ageRange
            if (p.badge) existingProduct.badge = p.badge
            if (validImages.length > 0) existingProduct.images = validImages
            if (p.tags && p.tags.length > 0) existingProduct.tags = p.tags
            existingProduct.isPublished = p.isPublished

            await existingProduct.save()
            updatedCount++
          } else {
            // Suffix slug to make it unique and create anyway
            let uniqueSlug = `${baseSlug}-${Date.now().toString(36)}-${i}`
            // ensure uniqueness
            while (await Product.exists({ slug: uniqueSlug })) {
              uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
            }

            await Product.create({
              title: p.title,
              slug: uniqueSlug,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              category: categoryId,
              inventory: p.inventory,
              description: p.description,
              longDescription: p.longDescription,
              ageRange: p.ageRange,
              badge: p.badge,
              images: validImages,
              tags: p.tags,
              isPublished: p.isPublished,
            })
            createdCount++
          }
        } else {
          // New product
          await Product.create({
            title: p.title,
            slug: baseSlug,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            category: categoryId,
            inventory: p.inventory,
            description: p.description,
            longDescription: p.longDescription,
            ageRange: p.ageRange,
            badge: p.badge,
            images: validImages,
            tags: p.tags,
            isPublished: p.isPublished,
          })
          createdCount++
        }
      } catch (err: unknown) {
        errors.push({
          row: rowNum,
          title: p.title,
          error: err instanceof Error ? err.message : String(err),
        })
        skippedCount++
      }
    }

    // 4. Update mobile timestamp & cache
    await touchProductsTimestamp()
    try {
      const { invalidateCache } = await import('@/lib/cache')
      await invalidateCache('products:*', 'product:*')
    } catch {
      // cache optional
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${createdCount} created, ${updatedCount} updated, ${skippedCount} failed.`,
      createdCount,
      updatedCount,
      skippedCount,
      totalProcessed: productsToImport.length,
      errors,
    })
  } catch (error: unknown) {
    console.error('[CSV Import Error]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error during import' },
      { status: 500 }
    )
  }
}

