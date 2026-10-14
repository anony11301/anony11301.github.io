import { handleUpload } from '@vercel/blob/client';
import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

function passwordOk(input) {
  const expected = process.env.UPLOAD_PASSWORD;
  if (!expected || typeof input !== 'string') return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  const body = await request.json();

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!passwordOk(clientPayload)) throw new Error('Password salah.');
        if (!/^gallery\/\d+__[A-Za-z0-9_-]*\.[a-z0-9]+$/i.test(pathname)) {
          throw new Error('Nama file tidak valid.');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
