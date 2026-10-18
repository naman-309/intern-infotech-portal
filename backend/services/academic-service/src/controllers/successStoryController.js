const { z } = require('zod');
const {
  prisma,
  successResponse,
  errorResponse,
  paginatedResponse,
  logAudit,
  invalidateCache,
} = require('@portal/shared');

const storySchema = z.object({
  studentName: z.string().min(2, 'Student name is required'),
  photoUrl: z.string().url().optional().or(z.literal('')),
  courseCompleted: z.string().min(2, 'Course completed is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  companyName: z.string().min(2, 'Company name is required'),
  companyLogoUrl: z.string().url().optional().or(z.literal('')),
  packageLPA: z.string().optional(),
  placementYear: z.number().int().min(2015).max(2035).default(new Date().getFullYear()),
  testimonial: z.string().min(10, 'Testimonial must be at least 10 characters'),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

class SuccessStoryController {
  /**
   * Public: List Published Stories
   */
  async getPublicStories(req, res, next) {
    try {
      const { featured } = req.query;

      const where = {
        published: true,
        ...(featured === 'true' && { featured: true }),
      };

      const stories = await prisma.studentSuccessStory.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { placementYear: 'desc' }, { createdAt: 'desc' }],
      });

      return successResponse(res, { data: { stories } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List All Stories
   */
  async getAllStories(req, res, next) {
    try {
      const { search = '', published, page = 1, limit = 15 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        ...(published !== undefined && { published: published === 'true' }),
        ...(search && {
          OR: [
            { studentName: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { jobTitle: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [total, stories] = await prisma.$transaction([
        prisma.studentSuccessStory.count({ where }),
        prisma.studentSuccessStory.findMany({
          where,
          skip,
          take,
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      ]);

      return paginatedResponse(res, {
        data: stories,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create Story
   */
  async createStory(req, res, next) {
    try {
      const data = storySchema.parse(req.body);

      const story = await prisma.studentSuccessStory.create({
        data,
      });

      await logAudit({
        userId: req.user.id,
        action: 'SUCCESS_STORY_CREATED',
        entity: 'StudentSuccessStory',
        entityId: story.id,
        details: { studentName: story.studentName, company: story.companyName },
        req,
      });

      await invalidateCache(['stories']);

      return successResponse(res, {
        statusCode: 201,
        message: 'Student success story created successfully',
        data: { story },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update Story
   */
  async updateStory(req, res, next) {
    try {
      const { id } = req.params;
      const data = storySchema.partial().parse(req.body);

      const story = await prisma.studentSuccessStory.update({
        where: { id },
        data,
      });

      await logAudit({
        userId: req.user.id,
        action: 'SUCCESS_STORY_UPDATED',
        entity: 'StudentSuccessStory',
        entityId: id,
        req,
      });

      await invalidateCache(['stories']);

      return successResponse(res, {
        message: 'Success story updated successfully',
        data: { story },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete Story
   */
  async deleteStory(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.studentSuccessStory.delete({ where: { id } });

      await logAudit({
        userId: req.user.id,
        action: 'SUCCESS_STORY_DELETED',
        entity: 'StudentSuccessStory',
        entityId: id,
        req,
      });

      await invalidateCache(['stories']);

      return successResponse(res, { message: 'Success story deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SuccessStoryController();
