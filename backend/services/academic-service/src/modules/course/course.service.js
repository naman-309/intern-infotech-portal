const slugify = require('slugify');
const {
  prisma,
  logAudit,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * Public: Get published courses
 */
const getPublicCourses = async ({ featured, search = '' }) => {
  const where = {
    published: true,
    isArchived: false,
    ...(featured === 'true' && { featured: true }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // Find all active public courses
  const courses = await prisma.course.findMany({
    where,
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      batches: {
        where: { status: { in: ['UPCOMING', 'ONGOING'] } },
        select: { id: true, name: true, batchCode: true, startDate: true, timing: true, status: true },
      },
    },
  });

  return courses;
};

/**
 * Public: Get course details by slug
 */
const getPublicCourseBySlug = async (slug) => {
  // Query single course by unique slug
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      batches: {
        where: { status: { in: ['UPCOMING', 'ONGOING'] } },
        select: { id: true, name: true, batchCode: true, startDate: true, timing: true, status: true },
      },
    },
  });

  if (!course || !course.published || course.isArchived) {
    const error = new Error('Course not found or unavailable');
    error.statusCode = 404;
    throw error;
  }

  return course;
};

/**
 * Admin: List all courses (including unpublished & archived)
 */
const getAllCourses = async ({ search = '', published, isArchived, page = 1, limit = 15 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {
    ...(published !== undefined && { published: published === 'true' }),
    ...(isArchived !== undefined && { isArchived: isArchived === 'true' }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // Run count and query in transaction
  const [total, courses] = await prisma.$transaction([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      skip,
      take,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { batches: true, enrollments: true },
        },
      },
    }),
  ]);

  return { courses, total, page: Number(page), limit: Number(limit) };
};

/**
 * Admin: Create Course
 */
const createCourse = async (data, user, req) => {
  // Generate unique slug from title
  let baseSlug = slugify(data.title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create course record in database
  const course = await prisma.course.create({
    data: {
      ...data,
      slug,
    },
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'COURSE_CREATED',
    entity: 'Course',
    entityId: course.id,
    details: { title: course.title, published: course.published },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('courses', 'public');
  await invalidateCache(['courses', 'public']);

  return course;
};

/**
 * Admin: Update Course
 */
const updateCourse = async (id, data, user, req) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  // Update in database
  const course = await prisma.course.update({
    where: { id },
    data,
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'COURSE_UPDATED',
    entity: 'Course',
    entityId: course.id,
    details: { changes: Object.keys(data) },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('courses', 'public');
  await invalidateCache(['courses', 'public']);

  return course;
};

/**
 * Admin: Archive Course
 */
const archiveCourse = async (id, user, req) => {
  const course = await prisma.course.update({
    where: { id },
    data: { isArchived: true, published: false },
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'COURSE_ARCHIVED',
    entity: 'Course',
    entityId: course.id,
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('courses', 'public');
  await invalidateCache(['courses', 'public']);

  return course;
};

module.exports = {
  getPublicCourses,
  getPublicCourseBySlug,
  getAllCourses,
  createCourse,
  updateCourse,
  archiveCourse,
};
