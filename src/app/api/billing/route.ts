import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge/client';

export async function GET() {
  try {
    const response = await insforge.get<{ plans: Array<{ id: string; name: string; price: number; features: string[] }> }>('/billing/plans');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Billing fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing plans' },
      { status: 500 }
    );
  }
}