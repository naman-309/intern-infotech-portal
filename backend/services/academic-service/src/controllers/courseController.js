const { z } = require('zod');
const slugify = require('slugify');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  invalidateCache,
} = require('@portal/shared');

const courseSchema = z.object({
  title: z.string().min(3, 'Course title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  curriculum: z.any().optional(), // modules / json
  duration: z.string().min(1, 'Duration is required (e.g. 6 Months)'),
  advertisedFee: z.number().nonnegative('Advertised fee cannot be negative').default(0),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

class CourseController {
  /**
   * Public: Get published courses
   */
  async getPublicCourses(req, res, next) {
    try {
      const { featured, search = '' } = req.query;

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

      return successResponse(res, { data: { courses } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: Get course details by slug
   */
  async getPublicCourseBySlug(req, res, next) {
    try {
      const { slug } = req.params;
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
        return errorResponse(res, { statusCode: 404, message: 'Course not found or unavailable' });
      }

      return successResponse(res, { data: { course } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all courses (including unpublished & archived)
   */
  async getAllCourses(req, res, next) {
    try {
      const { search = '', published, isArchived, page = 1, limit = 15 } = req.query;
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

      return paginatedResponse(res, {
        data: courses,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create Course
   */
  async createCourse(req, res, next) {
    try {
      const data = courseSchema.parse(req.body);

      // Generate unique slug
      let baseSlug = slugify(data.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.course.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const course = await prisma.course.create({
        data: {
          ...data,
          slug,
        },
      });

      await logAudit({
        userId: req.user.id,
        action: 'COURSE_CREATED',
        entity: 'Course',
        entityId: course.id,
        details: { title: course.title, published: course.published },
        req,
      });

      // Invalidate Upstash Redis cache so fresh data appears instantly
      await invalidateCache(['courses', 'public']);

      return successResponse(res, {
        statusCode: 201,
        message: 'Course created successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update Course
   */
  async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const data = courseSchema.partial().parse(req.body);

      const existing = await prisma.course.findUnique({ where: { id } });
      if (!existing) {
        return errorResponse(res, { statusCode: 404, message: 'Course not found' });
      }

      const course = await prisma.course.update({
        where: { id },
        data,
      });

      await logAudit({
        userId: req.user.id,
        action: 'COURSE_UPDATED',
        entity: 'Course',
        entityId: course.id,
        details: { changes: Object.keys(data) },
        req,
      });

      // Invalidate Upstash Redis cache so fresh data appears instantly
      await invalidateCache(['courses', 'public']);

      return successResponse(res, {
        message: 'Course updated successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Archive Course (Preserves historical enrollment and results!)
   */
  async archiveCourse(req, res, next) {
    try {
      const { id } = req.params;
      const course = await prisma.course.update({
        where: { id },
        data: { isArchived: true, published: false },
      });

      await logAudit({
        userId: req.user.id,
        action: 'COURSE_ARCHIVED',
        entity: 'Course',
        entityId: course.id,
        req,
      });

      // Invalidate Upstash Redis cache so fresh data appears instantly
      await invalidateCache(['courses', 'public']);

      return successResponse(res, {
        message: 'Course archived successfully. Historical records preserved.',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();
