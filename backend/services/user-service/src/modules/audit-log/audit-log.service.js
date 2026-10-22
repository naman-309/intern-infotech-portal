const { prisma } = require('@portal/shared');

/**
 * Fetch paginated audit log entries with optional action and entity filters
 */
const getAuditLogs = async ({ action, entity, page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {
    ...(action && { action: { contains: action, mode: 'insensitive' } }),
    ...(entity && { entity }),
  };

  // Run count and query concurrently
  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, role: true },
        },
      },
    }),
  ]);

  return { total, logs, page: Number(page), limit: Number(limit) };
};

module.exports = {
  getAuditLogs,
};
