import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        stockQuantity: true,
        inStock: true,
        price: true,
        image: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const xmlProducts = products.map(product => {
      // Availability logic
      const availability = (product.inStock && product.stockQuantity > 0) 
        ? 'in stock' 
        : 'out of stock';
        
      const link = `https://www.jpbstorex.com.br/product/${product.id}`;

      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || ''}]]></g:description>
      <g:brand>JPBStoreX</g:brand>
      <g:availability>${availability}</g:availability>
      <g:price>${Number(product.price).toFixed(2)} BRL</g:price>
      <g:link>${link}</g:link>
      <g:image_link>${product.image || ''}</g:image_link>
      <g:condition>new</g:condition>
      <g:quantity_to_sell_on_facebook>${product.stockQuantity}</g:quantity_to_sell_on_facebook>
      <g:inventory>${product.stockQuantity}</g:inventory>
    </item>`;
    }).join('');

    // Utilizing Google Merchant Center RSS format as it is the most standard for product feeds
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>JPB StoreX Products Feed</title>
    <link>https://www.jpbstorex.com.br</link>
    <description>Product feed for JPB StoreX</description>
${xmlProducts}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=0, max-age=0, must-revalidate', // Ensure it is updated on every access
      },
    });
  } catch (error) {
    console.error('Error generating feed.xml:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}
