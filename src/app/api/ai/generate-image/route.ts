import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, width, height, style, negativePrompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await insforge.aiGenerateImage({
      prompt,
      model,
      width,
      height,
      style,
      negativePrompt,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}