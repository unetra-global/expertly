import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

interface RevalidateBody {
  path: string;
  secret: string;
}

function safeCompare(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, 'utf8');
    const bBuf = Buffer.from(b, 'utf8');
    if (aBuf.length !== bBuf.length) {
      // Compare against itself to keep constant time, then return false.
      timingSafeEqual(aBuf, aBuf);
      return false;
    }
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

/**
 * POST /api/revalidate
 *
 * Validates the secret in the request body and revalidates the given path.
 * Called by the NestJS API after content updates (articles, members, events).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: RevalidateBody;
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const expected = process.env.REVALIDATION_SECRET ?? '';
  if (!safeCompare(body.secret ?? '', expected)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  if (!body.path || typeof body.path !== 'string') {
    return NextResponse.json(
      { error: 'path is required and must be a string' },
      { status: 400 },
    );
  }

  revalidatePath(body.path);

  return NextResponse.json({ revalidated: true, path: body.path });
}
