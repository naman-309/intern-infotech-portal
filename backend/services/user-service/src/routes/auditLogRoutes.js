const express = require('express');
const {
  prisma,
  authenticate,
  requireRole,
  paginatedResponse,
  cacheMiddleware,
} = require('@portal/shared');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/', cacheMiddleware({ prefix: 'audit_logs', ttl: 1200 }), async (req, res, next) => {
  try {
    const { action, entity, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      ...(action && { action: { contains: action, mode: 'insensitive' } }),
      ...(entity && { entity }),
    };

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

    return paginatedResponse(res, {
      data: logs,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
