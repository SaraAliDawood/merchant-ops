import { PrismaClient, type OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

const PRODUCT_COUNT = 40;
const CUSTOMER_COUNT = 300;
const ORDER_COUNT = 4000;

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const CATEGORIES = ['Coffee', 'Tea', 'Bakery', 'Snacks', 'Cold Drinks', 'Merch'];
const FIRST = ['Sara', 'Omar', 'Layla', 'Yousef', 'Nour', 'Ali', 'Huda', 'Khalid', 'Mona', 'Zaid'];
const LAST = ['Hassan', 'Ahmed', 'Khan', 'Ali', 'Saleh', 'Ibrahim', 'Farouk', 'Nasser'];

// Weighted status distribution — realistic funnel.
const STATUS_POOL: OrderStatus[] = [
  ...Array(55).fill('FULFILLED'),
  ...Array(25).fill('PAID'),
  ...Array(12).fill('PENDING'),
  ...Array(8).fill('CANCELLED'),
] as OrderStatus[];

async function main() {
  console.log('Clearing existing data…');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users…');
  await prisma.user.createMany({
    data: [
      {
        name: 'Admin User',
        email: 'admin@merchantops.dev',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'ADMIN',
      },
      {
        name: 'Staff User',
        email: 'staff@merchantops.dev',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'STAFF',
      },
    ],
  });
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@merchantops.dev' } });

  console.log(`Creating ${PRODUCT_COUNT} products…`);
  const products = Array.from({ length: PRODUCT_COUNT }, (_, i) => ({
    id: randomUUID(),
    sku: `SKU-${String(i + 1).padStart(4, '0')}`,
    name: `${pick(CATEGORIES)} Item ${i + 1}`,
    priceCents: randInt(5, 120) * 100,
    currency: 'AED',
    active: Math.random() > 0.08,
  }));
  await prisma.product.createMany({ data: products });
  const activeProducts = products.filter((p) => p.active);

  console.log(`Creating ${CUSTOMER_COUNT} customers…`);
  const customers = Array.from({ length: CUSTOMER_COUNT }, (_, i) => ({
    id: randomUUID(),
    name: `${pick(FIRST)} ${pick(LAST)}`,
    email: `customer${i + 1}@example.com`,
  }));
  await prisma.customer.createMany({ data: customers });

  console.log(`Creating ${ORDER_COUNT} orders (+ items)…`);
  const orderRows: {
    id: string;
    reference: string;
    status: OrderStatus;
    customerId: string;
    createdById: string;
    currency: string;
    totalCents: number;
    createdAt: Date;
  }[] = [];
  const itemRows: {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPriceCents: number;
  }[] = [];

  const now = Date.now();
  const DAY = 86_400_000;
  for (let i = 0; i < ORDER_COUNT; i++) {
    const orderId = randomUUID();
    const lineCount = randInt(1, 5);
    let total = 0;
    for (let j = 0; j < lineCount; j++) {
      const product = pick(activeProducts);
      const quantity = randInt(1, 4);
      total += quantity * product.priceCents;
      itemRows.push({
        id: randomUUID(),
        orderId,
        productId: product.id,
        quantity,
        unitPriceCents: product.priceCents,
      });
    }
    orderRows.push({
      id: orderId,
      reference: `ORD-2026-${String(i + 1).padStart(6, '0')}`,
      status: pick(STATUS_POOL),
      customerId: pick(customers).id,
      createdById: admin.id,
      currency: 'AED',
      totalCents: total,
      createdAt: new Date(now - randInt(0, 45) * DAY - randInt(0, DAY)),
    });
  }

  // Batch inserts keep seeding fast even at thousands of rows.
  for (let i = 0; i < orderRows.length; i += 500) {
    await prisma.order.createMany({ data: orderRows.slice(i, i + 500) });
  }
  for (let i = 0; i < itemRows.length; i += 1000) {
    await prisma.orderItem.createMany({ data: itemRows.slice(i, i + 1000) });
  }

  console.log(
    `Done: ${PRODUCT_COUNT} products, ${CUSTOMER_COUNT} customers, ${ORDER_COUNT} orders, ${itemRows.length} items.`,
  );
  console.log('Login: admin@merchantops.dev / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
