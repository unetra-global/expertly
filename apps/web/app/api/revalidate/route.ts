import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

interface RevalidateBody {
  path: string;
  secret: string;
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

  if (body.secret !== process.env.REVALIDATION_SECRET) {
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
