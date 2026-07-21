import { prisma } from '@/lib/db';
import { verifyPassword, signSession, setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { json, fail, handleError } from '@/lib/http';

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    // Same response whether the email is unknown or the password is wrong —
    // don't leak which accounts exist.
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return fail('Invalid email or password.', 401);
    }

    const token = await signSession({ userId: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);
    return json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    return handleError(err);
  }
}
