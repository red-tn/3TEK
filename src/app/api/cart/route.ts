import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ items: [] })
    }

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        quantity,
        product:products (
          id,
          name,
          slug,
          price_cents,
          images,
          stock_quantity,
          is_active
        )
      `
      )
      .eq('user_id', user.id)

    if (error) throw error

    // Filter out inactive products and format response
    const items = cartItems
      ?.filter((item) => item.product?.is_active)
      .map((item) => ({
        productId: item.product?.id,
        name: item.product?.name,
        price: item.product?.price_cents,
        quantity: item.quantity,
        image: item.product?.images?.[0]?.url,
        maxQuantity: item.product?.stock_quantity,
      }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity } = await req.json()

    // Check if item exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)

      if (error) throw error
    } else {
      // Add new item
      const { error } = await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: productId,
        quantity,
      })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart add error:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity } = await req.json()

    if (quantity <= 0) {
      // Remove item
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error
    } else {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (productId) {
      // Remove specific item
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) throw error
    } else {
      // Clear entire cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete from cart' },
      { status: 500 }
    )
  }
}
