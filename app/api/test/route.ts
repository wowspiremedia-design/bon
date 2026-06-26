import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(
    'https://cms.bonvoyagers.co/wp-json/wc/v3/products?category=15&per_page=2&consumer_key=ck_b88d72cf6f3d53f4ecf3f0122aa9e0038f70d966&consumer_secret=cs_63d38d45cf166bcdcc7d0dfca328a5d0c38593d6',
    { next: { revalidate: 0 } },
  )

  if (!res.ok) {
    return NextResponse.json({ ok: false, status: res.status, statusText: res.statusText }, { status: res.status })
  }

  const products = await res.json()

  return NextResponse.json({
    ok: true,
    count: products.length,
    products: products.map((p: { id: number; name: string; slug: string }) => ({ id: p.id, name: p.name, slug: p.slug })),
  })
}
