import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const response = await insforge.aiRemoveBackground(imageUrl);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove background' },
      { status: 500 }
    );
  }
}