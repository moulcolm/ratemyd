import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function GET() {
  try {
    // Test if Vercel Blob is configured
    const testData = Buffer.from('test');
    const blob = await put('test/test.txt', testData, {
      access: 'public',
      contentType: 'text/plain',
    });

    return NextResponse.json({
      success: true,
      message: 'Vercel Blob is working!',
      url: blob.url,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
