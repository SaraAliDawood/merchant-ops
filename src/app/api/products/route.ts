import { prisma } from '@/lib/db';
import { productCreateSchema } from '@/lib/validation';
import { requireUser, json, fail, handleError } from '@/lib/http';

// GET /api/products — list products (auth required).
export async function GET() {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return json(products);
}

// POST /api/products — create a product (ADMIN only).
export async function POST(req: Request) {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;
  if (guard.session.role !== 'ADMIN') return fail('Admin role required.', 403);

  try {
    const data = productCreateSchema.parse(await req.json());
    const product = await prisma.product.create({ data });
    return json(product, 201);
  } catch (err) {
    return handleError(err);
  }
}
