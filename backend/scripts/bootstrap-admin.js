const readline = require('readline');
const { prisma, hashPassword, logAudit } = require('../shared');

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function bootstrapAdmin() {
  console.log('========================================================');
  console.log('  INTERN INFOTECH — INITIAL ADMIN BOOTSTRAP WIZARD     ');
  console.log('========================================================\n');

  try {
    // Check if an admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log(`[INFO] An administrator already exists in the system: ${existingAdmin.email}`);
      console.log('If you need to create an additional administrator, use the Admin Portal.\n');
      process.exit(0);
    }

    let email = process.env.INITIAL_ADMIN_EMAIL;
    let password = process.env.INITIAL_ADMIN_PASSWORD;
    let firstName = process.env.INITIAL_ADMIN_FIRSTNAME || 'System';
    let lastName = process.env.INITIAL_ADMIN_LASTNAME || 'Administrator';

    if (!email || !password) {
      console.log('Environment variables INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD not set.');
      console.log('Starting interactive bootstrap...\n');

      email = await prompt('Enter Administrator Email: ');
      password = await prompt('Enter Secure Password (min 8 characters): ');
      firstName = (await prompt('Enter First Name [System]: ')) || 'System';
      lastName = (await prompt('Enter Last Name [Administrator]: ')) || 'Administrator';
    }

    if (!email || !email.includes('@')) {
      console.error('[ERROR] A valid email address is required.');
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error('[ERROR] Password must be at least 8 characters long.');
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);

    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        firstName,
        lastName,
        phone: '+91 99999 00000',
      },
    });

    await logAudit({
      userId: admin.id,
      action: 'INITIAL_ADMIN_BOOTSTRAPPED',
      entity: 'User',
      entityId: admin.id,
      details: { email: admin.email, role: 'ADMIN' },
    });

    console.log('\n[SUCCESS] Administrator account successfully created!');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role:  ${admin.role}`);
    console.log(`  ID:    ${admin.id}\n`);
    console.log('You may now log in via the web portal.\n');
  } catch (err) {
    console.error('[FATAL] Failed to bootstrap admin:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrapAdmin();
