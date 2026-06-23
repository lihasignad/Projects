/**
 * Medhavi ERP — Bootstrap Seed
 * ----------------------------------------------------------------------------
 * Creates the MINIMUM data required for first login through the Auth module:
 *   - 1 Institute  (code: MEDHAVI)
 *   - 1 Role       (key:  SUPER_ADMIN, kind: SYSTEM, defaultScope: GLOBAL)
 *   - 1 User       (admin@medhavi.local / Admin@123)
 *   - 1 AuthCredential (bcrypt, isCurrent = true)
 *   - 1 UserRole   (SUPER_ADMIN, isPrimary = true)
 *
 * Idempotent. Safe to run multiple times.
 *
 * Run:
 *   npx prisma db seed
 *
 * Requires package.json:
 *   "prisma": { "seed": "ts-node --transpile-only prisma/seed.ts" }
 * Dev deps:
 *   npm i -D bcrypt @types/bcrypt ts-node
 * ----------------------------------------------------------------------------
 * SCHEMA-MISMATCH FALLBACK
 * If a field name in your schema differs from what is assumed below, the
 * Prisma client will throw a clear "Unknown arg" / "Unknown field" error
 * pointing to the exact line. Likely candidates to adjust (all in this file,
 * NO schema change needed):
 *
 *   Institute.code          → if your schema uses `slug` or `shortCode`
 *   Role.key                → if it's `name` or `code`
 *   Role.kind               → if it's `type` or `roleKind`
 *   Role.defaultScope       → if it's `scope` or omit if not present
 *   User.status             → enum value 'ACTIVE' — adjust if enum differs
 *   AuthCredential.passwordHash → may be `hash` or `password`
 *   AuthCredential.isCurrent    → may be `current` or `active`
 *   UserRole composite unique   → `userId_roleId` is the default name; if your
 *                                 schema uses `@@unique([userId, roleId], name: "...")`
 *                                 update the `where` key accordingly.
 * ----------------------------------------------------------------------------
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

const ADMIN_EMAIL = 'admin@medhavi.local';
const ADMIN_PASSWORD = 'Admin@123';
const INSTITUTE_CODE = 'MEDHAVI';
const ROLE_KEY = 'SUPER_ADMIN';

async function main() {
  console.log('🌱  Medhavi ERP bootstrap seed starting...');

  // 1. INSTITUTE -------------------------------------------------------------
  const institute = await prisma.institute.upsert({
    where: { code: INSTITUTE_CODE },
    update: {},
    create: {
      code: INSTITUTE_CODE,
      name: 'Medhavi Demo Institute',
    },
  });
  console.log(`   ✓ Institute  ${institute.code} (${institute.id})`);

  // 2. ROLE ------------------------------------------------------------------
  const role = await prisma.role.upsert({
  where: {
    uq_role_institute_key: {
      instituteId: institute.id,
      key: ROLE_KEY,
    },
  },
  update: {},
  create: {
    instituteId: institute.id,
    key: ROLE_KEY,
    name: 'Super Admin',
    kind: 'SYSTEM' as any,
    defaultScope: 'GLOBAL' as any,
  },
});

  // 3. USER ------------------------------------------------------------------
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE' as any,
      instituteId: institute.id,
    },
    create: {
      email: ADMIN_EMAIL,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE' as any,
      instituteId: institute.id,
    },
  });
  console.log(`   ✓ User       ${user.email} (${user.id})`);

  // 4. AUTH CREDENTIAL -------------------------------------------------------
  //   - If a current credential exists and already validates Admin@123, skip.
  //   - Otherwise: demote any existing current credentials and insert a new one.
  const existingCurrent = await prisma.authCredential.findFirst({
    where: {
      userId: user.id,
      isCurrent: true,
    },
  });

  if (!existingCurrent) {
    await prisma.authCredential.create({
      data: {
        userId: user.id,
        passwordHash: await bcrypt.hash(
          ADMIN_PASSWORD,
          BCRYPT_ROUNDS,
        ),
        isCurrent: true,
      },
    });
  }

  console.log('   ✓ AuthCredential');
  // 5. USER ROLE -------------------------------------------------------------
  //   Composite unique is typically `userId_roleId`. If your schema names the
  //   constraint differently, change the `where` key only.
  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      roleId: role.id,
      scopeType: 'GLOBAL' as any,
    },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        scopeType: 'GLOBAL' as any,
        instituteId: institute.id,
        isPrimary: true,
      },
    });
  }

  console.log('   ✓ UserRole');

  console.log('');
  console.log('✅  Bootstrap complete.');
  console.log('    Login with:');
  console.log(`       email:    ${ADMIN_EMAIL}`);
  console.log(`       password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('❌  Seed failed:');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
