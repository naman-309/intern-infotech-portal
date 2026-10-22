const { prisma, logAudit, invalidateCache, redisClient } = require('@portal/shared');

/**
 * List Authorized Eligible Emails
 */
const getEligibleEmails = async ({ search = '', isRegistered, page = 1, limit = 15 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {
    ...(isRegistered !== undefined && { isRegistered: isRegistered === 'true' }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { offlineRegNumber: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // Run count and query in transaction
  const [total, records] = await prisma.$transaction([
    prisma.eligibleStudentEmail.count({ where }),
    prisma.eligibleStudentEmail.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        addedByAdmin: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
  ]);

  return { total, records, page: Number(page), limit: Number(limit) };
};

/**
 * Add a single eligible student record
 */
const addEligibleEmail = async (data, adminUser, req) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  // Check if eligible record already exists for this email
  const existing = await prisma.eligibleStudentEmail.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    const error = new Error('An eligible record for this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Create offline record in database
  const record = await prisma.eligibleStudentEmail.create({
    data: {
      email: normalizedEmail,
      fullName: data.fullName,
      offlineRegNumber: data.offlineRegNumber || `OFFLINE-${Date.now().toString().slice(-6)}`,
      phone: data.phone,
      courseHint: data.courseHint,
      addedByAdminId: adminUser.id,
    },
  });

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'ELIGIBLE_EMAIL_ADDED',
    entity: 'EligibleStudentEmail',
    entityId: record.id,
    details: { email: normalizedEmail, fullName: data.fullName },
    req,
  });

  // Invalidate eligible emails cache
  await redisClient.del('eligible_emails');
  await invalidateCache(['eligible_emails']);

  return record;
};

/**
 * Bulk import eligible students
 */
const bulkImport = async (students, adminUser, req) => {
  let createdCount = 0;
  let skippedCount = 0;

  for (const item of students) {
    const normalizedEmail = item.email.toLowerCase().trim();
    const existing = await prisma.eligibleStudentEmail.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      await prisma.eligibleStudentEmail.create({
        data: {
          email: normalizedEmail,
          fullName: item.fullName,
          offlineRegNumber: item.offlineRegNumber || `OFFLINE-${Date.now().toString().slice(-6)}-${createdCount}`,
          phone: item.phone,
          courseHint: item.courseHint,
          addedByAdminId: adminUser.id,
        },
      });
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'ELIGIBLE_EMAILS_BULK_IMPORTED',
    entity: 'EligibleStudentEmail',
    details: { imported: createdCount, skipped: skippedCount },
    req,
  });

  // Invalidate cache
  await redisClient.del('eligible_emails');
  await invalidateCache(['eligible_emails']);

  return { createdCount, skippedCount };
};

/**
 * Remove an eligible record
 */
const deleteEligibleEmail = async (id, adminUser, req) => {
  const record = await prisma.eligibleStudentEmail.findUnique({ where: { id } });
  if (!record) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  // Delete from database
  await prisma.eligibleStudentEmail.delete({ where: { id } });

  // Log audit event
  await logAudit({
    userId: adminUser.id,
    action: 'ELIGIBLE_EMAIL_DELETED',
    entity: 'EligibleStudentEmail',
    entityId: id,
    details: { email: record.email },
    req,
  });

  // Invalidate cache
  await redisClient.del('eligible_emails');
  await invalidateCache(['eligible_emails']);

  return { message: 'Eligible student record removed.' };
};

module.exports = {
  getEligibleEmails,
  addEligibleEmail,
  bulkImport,
  deleteEligibleEmail,
};
