//routes/reportRoutes.js


const express = require('express');
const router = express.Router();
const {
		createReport, getUserReports, getReportById, 
		getByTrackingId, getAllReports, updateStatus, updateStatusByTrackingId,
		updatePriorityAssigned, updateAssigned, deleteReport,
		getAssignedReports, markReportComplete
	} = require ('../controllers/reportController');
const { 
		protect, admin, 
		requireOnboardingComplete,
	} = require ('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');



/**
 * @swagger
 * components:
 *   schemas:
 *     ContactDetails:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *           example: "+2348012345678"
 *         email:
 *           type: string
 *           format: email
 *     Report:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         trackingId:
 *           type: string
 *         category:
 *           type: string
 *           enum: [illegal, overflowing, blocked, missed, general, burning, uncategorized, other]
 *         state:
 *           type: string
 *         lga:
 *           type: string
 *         address:
 *           type: string
 *         description:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         contactDetails:
 *           $ref: '#/components/schemas/ContactDetails'
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         status:
 *           type: string
 *           enum: [PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         createdBy:
 *           type: string
 *         assignedTo:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create a new trash report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - state
 *               - lga
 *               - address
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [illegal, overflowing, blocked, missed, general, burning, uncategorized, other]
 *               state:
 *                 type: string
 *               lga:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Trash report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Invalid category
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports related to the logged-in user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 */


/**
 * @swagger
 * /reports/{strackingId}:
 *   get:
 *     summary: Get a report by tracking ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: strackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report tracking ID
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
 

/**
 * @swagger
 * /allReports:
 *   get:
 *     summary: Get all reports (admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [illegal, overflowing, blocked, missed, general, burning, uncategorized, other]
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *                 currentPage:
 *                   type: integer
 *                 totalReports:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 hasNextPage:
 *                   type: boolean
 *                 hasPrevPage:
 *                   type: boolean
 */





/**
 * @swagger
 * /reports/id/{id}/status:
 *   put:
 *     summary: Update the status of a report (admin or assigned user)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Report not found
 */



/**
 * @swagger
 * /reports/id/{id}/assign:
 *   put:
 *     summary: Assign a report to a staff and/or update priority (admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       200:
 *         description: Report assignment and priority updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Report or staff not found
 */

/**
 * @swagger
 * /reports/tracking/{trackingId}/assign:
 *   put:
 *     summary: Assign a report by tracking ID and/or update priority (admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report tracking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       200:
 *         description: Report assignment and priority updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Report or staff not found
 */


/**
 * @swagger
 * /reports/{id}/delete:
 *   delete:
 *     summary: Delete a report (admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Report not found
 */


// Create report
router.post('/reports', protect, requireOnboardingComplete, upload.array('images', 5), createReport);

// Read
router.get('/reports', protect, requireOnboardingComplete, getUserReports);
router.get('/reports/:id', protect, requireOnboardingComplete, getReportById);
router.get('/reports/track/:trackingId', protect, requireOnboardingComplete, getByTrackingId);
router.get('/allReports', protect, requireOnboardingComplete, admin, getAllReports);
router.get('/reports/assign/assigned', protect, getAssignedReports);


// Update (status / assignment)

router.put('/reports/id/:id/assign', protect, requireOnboardingComplete, admin, updatePriorityAssigned);
router.put('/reports/tracking/:trackingId/assign', protect, requireOnboardingComplete, admin, updateAssigned);
router.put('/reports/id/:id/status', protect, requireOnboardingComplete, admin, updateStatus);
router.put('/reports/tracking/:trackingId/status', protect, requireOnboardingComplete, updateStatusByTrackingId);
router.put('/reports/:id/complete', protect, markReportComplete);


// Delete
router.delete('/reports/:id/delete', protect, requireOnboardingComplete, admin, deleteReport);

module.exports = router;