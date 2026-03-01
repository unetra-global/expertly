import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

interface RevalidateBody {
  path: string;
}

/**
 * POST /api/revalidate
 *
 * Validates the REVALIDATION_SECRET header and revalidates the given path.
 * Called by the NestJS API after content updates (articles, members, events).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get('x-revalidation-secret');
  const expectedSecret = process.env.REVALIDATION_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.path || typeof body.path !== 'string') {
    return NextResponse.json(
      { error: 'path is required and must be a string' },
      { status: 400 },
    );
  }

  revalidatePath(body.path);

  return NextResponse.json(
    { revalidated: true, path: body.path, revalidatedAt: new Date().toISOString() },
    { status: 200 },
  );
}
