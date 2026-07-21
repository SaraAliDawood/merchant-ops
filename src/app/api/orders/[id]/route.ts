import { prisma } from '@/lib/db';
import { orderStatusSchema } from '@/lib/validation';
import { assertTransition } from '@/lib/orders';
import { requireUser, json, fail, handleError } from '@/lib/http';

// GET /api/orders/:id — full order with items and product detail.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { name: true, email: true } },
      items: { include: { product: true } },
    },
  });
  if (!order) return fail('Order not found.', 404);
  return json(order);
}

// PATCH /api/orders/:id — advance the order through its status state machine.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;

  try {
    const { id } = await params;
    const { status } = orderStatusSchema.parse(await req.json());

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return fail('Order not found.', 404);

    assertTransition(order.status, status);

    const updated = await prisma.order.update({ where: { id }, data: { status } });
    return json(updated);
  } catch (err) {
    return handleError(err);
  }
}
