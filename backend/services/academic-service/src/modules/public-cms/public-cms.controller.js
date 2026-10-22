const publicCmsService = require('./public-cms.service');
const { successResponse } = require('@portal/shared');

/**
 * Public: Get Institute Overview & Statistics
 */
const getInstituteOverview = async (req, res, next) => {
  try {
    const data = await publicCmsService.getInstituteOverview();
    return successResponse(res, { data });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate signed Cloudinary upload params
 */
const getUploadSignature = async (req, res, next) => {
  try {
    const folder = req.query.folder || 'infotech-portal';
    const params = publicCmsService.getUploadSignature(folder);
    return successResponse(res, { data: params });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInstituteOverview,
  getUploadSignature,
};
