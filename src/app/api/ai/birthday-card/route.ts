import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personName, age, occasionType, tone, message, senderName, photoUrl } = body;

    if (!personName) {
      return NextResponse.json({ error: 'Person name is required' }, { status: 400 });
    }

    const response = await insforge.aiBirthdayCard({
      personName,
      age,
      occasionType,
      tone,
      message,
      senderName,
      photoUrl,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Birthday card generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate birthday card writeup' },
      { status: 500 }
    );
  }
}