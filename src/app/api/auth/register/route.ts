import { prisma } from '@/lib/db';
import { hashPassword, signSession, setSessionCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { json, fail, handleError } from '@/lib/http';

// POST /api/auth/register — create the first account (becomes ADMIN if none exist).
export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return fail('That email is already registered.', 409);

    const userCount = await prisma.user.count();
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: await hashPassword(body.password),
        role: userCount === 0 ? 'ADMIN' : 'STAFF',
      },
    });

    const token = await signSession({ userId: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);
    return json({ id: user.id, email: user.email, name: user.name, role: user.role }, 201);
  } catch (err) {
    return handleError(err);
  }
}
