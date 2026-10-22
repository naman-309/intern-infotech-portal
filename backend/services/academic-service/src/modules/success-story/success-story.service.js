const {
  prisma,
  logAudit,
  invalidateCache,
  redisClient,
} = require('@portal/shared');

/**
 * Public: List Published Stories
 */
const getPublicStories = async ({ featured }) => {
  const where = {
    published: true,
    ...(featured === 'true' && { featured: true }),
  };

  const stories = await prisma.studentSuccessStory.findMany({
    where,
    orderBy: [{ displayOrder: 'asc' }, { placementYear: 'desc' }, { createdAt: 'desc' }],
  });

  return stories;
};

/**
 * Admin: List All Stories
 */
const getAllStories = async ({ search = '', published, page = 1, limit = 15 }) => {
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

  return { stories, total, page: Number(page), limit: Number(limit) };
};

/**
 * Admin: Create Story
 */
const createStory = async (data, user, req) => {
  const story = await prisma.studentSuccessStory.create({
    data,
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'SUCCESS_STORY_CREATED',
    entity: 'StudentSuccessStory',
    entityId: story.id,
    details: { studentName: story.studentName, company: story.companyName },
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('stories');
  await invalidateCache(['stories']);

  return story;
};

/**
 * Admin: Update Story
 */
const updateStory = async (id, data, user, req) => {
  const story = await prisma.studentSuccessStory.update({
    where: { id },
    data,
  });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'SUCCESS_STORY_UPDATED',
    entity: 'StudentSuccessStory',
    entityId: id,
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('stories');
  await invalidateCache(['stories']);

  return story;
};

/**
 * Admin: Delete Story
 */
const deleteStory = async (id, user, req) => {
  await prisma.studentSuccessStory.delete({ where: { id } });

  // Log audit
  await logAudit({
    userId: user.id,
    action: 'SUCCESS_STORY_DELETED',
    entity: 'StudentSuccessStory',
    entityId: id,
    req,
  });

  // Explicit Redis cache invalidation on mutation
  await redisClient.del('stories');
  await invalidateCache(['stories']);

  return { message: 'Success story deleted' };
};

module.exports = {
  getPublicStories,
  getAllStories,
  createStory,
  updateStory,
  deleteStory,
};
