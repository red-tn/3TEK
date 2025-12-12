import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/server'
import { productSchema } from '@/lib/validations'

async function checkAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_admin) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user }
}

export async function GET(req: Request) {
  const auth = await checkAdminAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    let query = supabaseAdmin
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return NextResponse.json({
      products: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const auth = await checkAdminAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const validatedData = productSchema.parse(body)

    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: validatedData.name,
      description: validatedData.shortDescription || undefined,
      images: validatedData.images.slice(0, 8).map((img) => img.url),
      metadata: {
        sku: validatedData.sku || '',
      },
    })

    // Create Stripe price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: validatedData.priceCents,
      currency: 'usd',
    })

    // Create product in database
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        short_description: validatedData.shortDescription,
        category_id: validatedData.categoryId,
        price_cents: validatedData.priceCents,
        compare_at_price_cents: validatedData.compareAtPriceCents,
        cost_cents: validatedData.costCents,
        sku: validatedData.sku,
        stock_quantity: validatedData.stockQuantity,
        track_inventory: validatedData.trackInventory,
        allow_backorder: validatedData.allowBackorder,
        weight_oz: validatedData.weightOz,
        material: validatedData.material,
        color: validatedData.color,
        print_time_hours: validatedData.printTimeHours,
        images: validatedData.images,
        is_active: validatedData.isActive,
        is_featured: validatedData.isFeatured,
        badge: validatedData.badge,
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        meta_title: validatedData.metaTitle,
        meta_description: validatedData.metaDescription,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const auth = await checkAdminAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const body = await req.json()

    // Build update object with only fields that exist in DB schema
    // Products table has: name, slug, description, price_cents, compare_at_price_cents,
    // category_id, images, is_active, is_featured, stock_quantity, sku, weight_grams, dimensions, metadata
    const updateData: Record<string, unknown> = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.categoryId !== undefined) updateData.category_id = body.categoryId
    if (body.priceCents !== undefined) updateData.price_cents = body.priceCents
    if (body.compareAtPriceCents !== undefined) updateData.compare_at_price_cents = body.compareAtPriceCents
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.stockQuantity !== undefined) updateData.stock_quantity = body.stockQuantity
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    if (body.isFeatured !== undefined) updateData.is_featured = body.isFeatured
    if (body.images !== undefined) updateData.images = body.images
    // Store extra fields in metadata JSON column
    if (body.shortDescription !== undefined || body.material !== undefined || body.color !== undefined || body.badge !== undefined) {
      updateData.metadata = {
        short_description: body.shortDescription || null,
        material: body.material || null,
        color: body.color || null,
        badge: body.badge || null,
      }
    }

    // Update product in database
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  console.log('DELETE /api/admin/products called')

  const auth = await checkAdminAuth()
  if ('error' in auth) {
    console.log('Auth failed:', auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    console.log('Deleting product ID:', id)

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get product to check status and archive Stripe product
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('stripe_product_id, is_active')
      .eq('id', id)
      .single()

    console.log('Product fetch result:', { product, fetchError })

    if (!product) {
      console.log('Product not found for ID:', id)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Archive Stripe product if exists (ignore errors if product doesn't exist in Stripe)
    if (product.stripe_product_id) {
      try {
        await stripe.products.update(product.stripe_product_id, {
          active: false,
        })
      } catch (stripeError) {
        console.log('Stripe product archive skipped:', stripeError)
      }
    }

    if (product.is_active) {
      // Product is active - soft delete by setting is_active to false
      const { error } = await supabaseAdmin
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ success: true, action: 'deactivated' })
    } else {
      // Product is already inactive - permanently delete
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ success: true, action: 'deleted' })
    }
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
