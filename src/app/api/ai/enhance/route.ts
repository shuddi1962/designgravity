import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, enhancementType, strength } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const response = await insforge.aiEnhanceImage({
      imageUrl,
      enhancementType,
      strength,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance image' },
      { status: 500 }
    );
  }
}