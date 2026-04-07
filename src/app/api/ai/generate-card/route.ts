import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge/client';
import { eventBus, EVENTS } from '@/lib/event-bus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, templateId, photoUrl } = body;

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    eventBus.emit(EVENTS.AI_GENERATION_STARTED, { type: 'birthday-card', cardId });

    const response = await insforge.aiBirthdayCardAutoDesign({
      cardId,
      templateId,
      photoUrl,
    });

    eventBus.emit(EVENTS.AI_GENERATION_COMPLETED, { type: 'birthday-card', cardId });

    return NextResponse.json({
      designUrl: response.cardDesignUrl,
      cardId,
    });
  } catch (error) {
    console.error('Card generation error:', error);
    eventBus.emit(EVENTS.AI_GENERATION_FAILED, { type: 'birthday-card', error: String(error) });
    return NextResponse.json(
      { error: 'Failed to generate birthday card' },
      { status: 500 }
    );
  }
}
