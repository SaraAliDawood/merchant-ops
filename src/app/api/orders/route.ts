import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { orderCreateSchema } from '@/lib/validation';
import { computeTotalCents, buildReference } from '@/lib/orders';
import { requireUser, json, handleError } from '@/lib/http';
import { parsePageParams, paginated } from '@/lib/pagination';

// GET /api/orders?query=&status=&page=&pageSize=
// Paginated, searchable, status-filtered — built for large datasets.
export async function GET(req: Request) {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;

  const url = new URL(req.url);
  const { page, pageSize, skip, take } = parsePageParams(url.searchParams);
  const status = url.searchParams.get('status') || undefined;
  const query = url.searchParams.get('query')?.trim();

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status: status as never } : {}),
    ...(query
      ? {
          OR: [
            { reference: { contains: query } },
            { customer: { is: { name: { contains: query } } } },
            { customer: { is: { email: { contains: query } } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  return json(paginated(rows, total, page, pageSize));
}

// POST /api/orders — create an order from customer + line items.
export async function POST(req: Request) {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;

  try {
    const body = orderCreateSchema.parse(await req.json());

    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: body.customerId } });
      if (!customer) throw new Error('Customer not found.');

      const productIds = body.items.map((i) => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const priceById = new Map(products.map((p) => [p.id, p]));

      const lines = body.items.map((item) => {
        const product = priceById.get(item.productId);
        if (!product) throw new Error(`Unknown product: ${item.productId}`);
        if (!product.active) throw new Error(`Product is inactive: ${product.name}`);
        return {
          productId: product.id,
          quantity: item.quantity,
          unitPriceCents: product.priceCents,
        };
      });

      const totalCents = computeTotalCents(lines);
      const year = new Date().getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const seq = (await tx.order.count({ where: { createdAt: { gte: startOfYear } } })) + 1;

      return tx.order.create({
        data: {
          reference: buildReference(year, seq),
          customerId: customer.id,
          createdById: guard.session.userId,
          currency: products[0]?.currency ?? 'AED',
          totalCents,
          items: { create: lines },
        },
        include: { items: true, customer: true },
      });
    });

    return json(order, 201);
  } catch (err) {
    return handleError(err);
  }
}
