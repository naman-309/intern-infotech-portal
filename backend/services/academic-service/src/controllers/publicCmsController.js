const {
  prisma,
  successResponse,
  getSignedUploadParams,
} = require('@portal/shared');

class PublicCmsController {
  /**
   * Public: Get Institute Overview & Statistics
   */
  async getInstituteOverview(req, res, next) {
    try {
      const [coursesCount, storiesCount, batchesCount, activeStudentsCount] = await Promise.all([
        prisma.course.count({ where: { published: true, isArchived: false } }),
        prisma.studentSuccessStory.count({ where: { published: true } }),
        prisma.batch.count({ where: { status: { in: ['UPCOMING', 'ONGOING'] } } }),
        prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
      ]);

      const instituteData = {
        name: 'Intern Infotech Institute of Software Engineering',
        tagline: 'Master Production-Grade Full-Stack & Systems Engineering with Industry Architects',
        description: 'Intern Infotech is an elite offline technical coaching institute dedicated to building the next generation of senior software engineers, distributed systems builders, and cloud architects through rigorous offline laboratory courses.',
        campus: {
          address: '404, 4th Floor, Vibrant Business Tower, Geeta Bhawan Square, 9A/9B Manoromaganj, A.B. Road, Indore, Madhya Pradesh 452001',
          phone: '+91 98260 64440',
          email: 'admissions@infotech-academy.edu',
          officeHours: 'Monday – Saturday: 9:00 AM – 7:00 PM',
        },
        stats: {
          alumniPlaced: 1250 + storiesCount,
          activeCourses: coursesCount || 6,
          activeBatches: batchesCount || 8,
          activeStudents: activeStudentsCount || 240,
          averageHike: '140%',
          topPackage: '42 LPA',
        },
        technologies: [
          { name: 'JavaScript & React', category: 'Frontend', level: 'Production Core' },
          { name: 'Node.js & Express', category: 'Backend', level: 'Microservices Architecture' },
          { name: 'PostgreSQL & Prisma', category: 'Databases', level: 'Relational & Query Tuning' },
          { name: 'Redis & BullMQ', category: 'Caching & Queues', level: 'Durable Async Systems' },
          { name: 'Docker & Nginx', category: 'DevOps', level: 'Reverse Proxy & Containers' },
          { name: 'Data Structures & Algorithms', category: 'CS Fundamentals', level: 'Offline Problem Solving' },
          { name: 'System Design & High Availability', category: 'Architecture', level: 'Large-Scale Engineering' },
        ],
      };

      return successResponse(res, { data: instituteData });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate signed Cloudinary upload params (Admin / Teacher upload images)
   */
  async getUploadSignature(req, res, next) {
    try {
      const folder = req.query.folder || 'infotech-portal';
      const params = getSignedUploadParams(folder);
      return successResponse(res, { data: params });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicCmsController();
