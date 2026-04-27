/**
 * SARA Test Chat API
 * POST /api/chat — direct SARA conversation without WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { callSARA, ConversationMessage } from '@/lib/sara';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await callSARA(message, {
      clientPhone: 'test-user',
      conversationHistory: (history as ConversationMessage[]) || [],
    });

    return NextResponse.json({
      response: result.response,
      needsHuman: result.needsHuman,
      crmUpdate: result.crmUpdate,
    });
  } catch (err: any) {
    console.error('[Chat API] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
