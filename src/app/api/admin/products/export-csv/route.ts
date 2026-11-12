import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import Product from '@/models/Product'
import { generateProductsCsv } from '@/lib/csvHelper'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'manager'].includes((session.user as { role?: string })?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const products = await Product.find({})
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean()

    const csvData = generateProductsCsv(products as Record<string, unknown>[])

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export products' },
      { status: 500 }
    )
  }
}

