//controllers/reportController.js

const User = require('../models/User');
const Report = require('../models/report');
const { generateTrackingId } = require('../utils/generateTrackingId');
const redis = require('../config/redis');
const { notify } = require('../service/notificationService');
const Template = require('../utils/messageTemplate');


//POST  Create Report
exports.createReport = async (req, res) => {
	try {

		const {
			category, state, lga,
			address, description,
			notificationPreference
		} = req.body;

		if (!category || !state || !lga || !address) 
      		return res.status(400).json({ message: 'Missing required fields' });
    	
    	const allowedCategory = [
							'illegal', 'overflowing', 'blocked', 
							'missed', 'general', 'burning',
							'uncategorized', 'other'
						];

		if(!allowedCategory.includes(category))
			return res.status(404).json({ message: `Allowed category are ${allowedCategory}` });

		// Generate unique tracking ID
	    let trackingId;
	    let exists = true;

	    while (exists) {
	      	trackingId = generateTrackingId();
	      	exists = await Report.exists({ trackingId });
	      	if (!exists) break;
	    }

		//file upload
		const images = req.files?.map(file => file.path) || [];


		//Create trash report
		const report = await Report.create({
			trackingId,
			category,
			state,
			lga,
			address,
			description,
			images,
			notificationPreference: notificationPreference || 'EMAIL',
			contactDetails: {
		        name: `${req.user.firstName} ${req.user.lastName}`,
		        phone: req.user.profile?.phone,
		    		email: req.user.email
		    },
		    createdBy: req.user._id
		});

		//Notification
		await notify({
			user: req.user,
			template: Template.reportCreated(report.trackingId),
			preference: report.notificationPreference
		}).catch(console.error);


		// Invalidate list cache
    await redis.del(`reports:user:${req.user._id}`);


    	res.status(201).json({
	      	message: 'Trash report created successfully',
	      	report
	    });

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};


//GET  Get reports relating to the user
exports.getUserReports = async (req, res) => {
	try{

		const userId = req.user._id;

		//check reports related to user id in redis
		const cacheKey = `reports:user:${userId}`;

		//get cached report key
		const cached = await redis.get(cacheKey);
		if (cached)
			return res.json(JSON.parse(cached));

		//find reports related to userId and sort in DB
		const reports = await Report.find({ createdBy: userId })
																.populate('createdBy', 'email')
    														.populate('assignedTo', 'email')
																.sort({ createdAt: -1 });

		// add and set to redis
		await redis.setex(cacheKey, 300, JSON.stringify(reports));      //5 mins

		res.json(reports);

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};


//GET Get report by id
exports.getReportById = async (req, res) => {
	try {
		const userId = req.user._id;

		//get cached report
		const cacheKey = `report:${req.params.id}`;

		const cached = await redis.get(cacheKey);
		if (cached)
			return res.json(JSON.parse(cached));

		//Find by id
		const report = await Report.findById(req.params.id)
									.populate('createdBy', 'email')
									.populate('assignedTo', 'email');

		if(!report)
			return res.status(404).json({ message: 'Report not found'});

		// set/add to redis
		await redis.setex(cacheKey, 300, JSON.stringify(report));

		res.json(report);

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};



//GET  Get by Tracking ID
exports.getByTrackingId = async (req,res) => {
	try {

		const { trackingId } = req.params;

		if(!trackingId)
			return res.status(404).json({ message: 'Tracking Id is required'});
		const userId = req.user._id;

		//get cached report
		const cacheKey = `report:tracking:${trackingId}`;

		const cached = await redis.get(cacheKey);
		if (cached)
			return res.json(JSON.parse(cached));

		//find report
		const report = await Report.findOne({ trackingId })
															.populate('createdBy', 'email')
      												.populate('assignedTo', 'email');

		if (!report)
			return res.status(404).json({ message: 'Report not found'});

		await redis.setex(cacheKey, 300, JSON.stringify(report));

		res.json(report);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};



//GET   Get all reports
exports.getAllReports = async (req, res) => {
	try {

		let { page = 1, limit = 10, category } = req.query;

		page = parseInt(page);
		limit = parseInt(limit);

		const query = {}; 

		if(category)
			query.category = category;

		const skip = (page - 1) * limit;

		// dynamic cache key
		const cacheKey = `reports:page=${page}:limit=${limit}:category=${category || 'all'}`;

    	const cached = await redis.get(cacheKey);
	    if (cached) {
	    	return res.json({
	        source: 'cache',
	        reports: JSON.parse(cached)
	      });
	    }

	    //get from DB
	    const reports = await Report.find(query)
						      .populate('createdBy', 'email role')
						      .populate('assignedTo', 'email')
						      .skip(skip)
									.limit(limit)
						      .sort({ createdAt: -1 });

		
		//count total Notes
		const totalReports = await Report.countDocuments(query);

		//total pages
		const totalPages = Math.ceil (totalReports / limit);

		// prepare response
    const response = {
      reports,
      currentPage: page,
      totalReports,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    // cache the response
    await redis.setex(cacheKey, 300, JSON.stringify(response));

	  res.json({
			source: 'db',
	   	...response,
	  });

	} catch (err) {
		res.status(500).json({ message: err.message });
	}

};





//PUT  UPDATE ASSIGN BY EMAIL + PRIORITY  BY REPORT ID
exports.updatePriorityAssigned = async (req,res) => {
	try {

		const { priority, email } = req.body; 

		//find report
		const report = await Report.findById(req.params.id);

		if(!report)
			return res.status(404).json({ message: 'Report not found'});

		//Accessing must be admin
    	if ( req.user.role !== 'admin' ) 
      		return res.status(403).json({ message: 'Not authorized, you have to be an admin' });
    	
		//Allowed Priority
    if (priority) {
    	const allowedPriority = ['LOW', 'MEDIUM', 'HIGH'];

			if (!allowedPriority.includes(priority))
	    		return res.status(400).json({ message: `Allowed priority are ${allowedPriority}`});

		    report.priority = priority;
    }

    // If already assigned
    if (report.assignedTo) {
      const currentAssignee = await User.findById(report.assignedTo);
      return res.status(200).json({
        message: `Report has already been assigned to ${currentAssignee?.email || 'a user'}`
      });
    }
    
    // Email must exist
		if (!email)
			return res.status(400).json({ message: 'Email is required for assignment' });

		const assignee = await User.findOne({ email, role: 'staff' });

		if (!assignee)
			return res.status(404).json({ message: 'Assigned user not found' });

		
    //Update 

    report.assignedTo = assignee._id;
    report.status = 'ASSIGNED';

		await report.save();

		//Notification
		await notify ({
			user: assignee,
			template: Template.reportAssigned(report.trackingId),
			preference: report.notificationPreference
		}).catch(console.error);

		// Invalidate caches
		//Delete or invalidate user's report list
	    await redis.del('reports:all');
	    //Delete or Invalidate the single-report cache
	    await redis.del(`report:${req.params.id}`);

	    res.json({
	      	message: 'Trash report priority and assignedTo updated',
	      	report
	    });

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};




// PUT UPDATE ASSIGN BY TRACKING ID + PRIORITY
exports.updateAssigned = async (req, res) => {
  try {
    const { priority, email } = req.body;
    const { trackingId } = req.params;

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized, admin access required'
      });
    }

    // Validate priority
    const allowedPriority = ['LOW', 'MEDIUM', 'HIGH'];
    if (priority && !allowedPriority.includes(priority)) {
      return res.status(400).json({
        message: `Allowed priority values are ${allowedPriority.join(', ')}`
      });
    }

    // Find report by trackingId
    const report = await Report.findOne({ trackingId });
    if (!report) {
      return res.status(404).json({
        message: 'Report not found'
      });
    }


    // If already assigned
    if (report.assignedTo) {
      const currentAssignee = await User.findById(report.assignedTo);
      return res.status(200).json({
        message: `Report has already been assigned to ${currentAssignee?.email || 'a user'}`
      });
    }

    // Find assignee by email
    const assignee = await User.findOne({ email, role: 'staff' });
    if (!assignee) {
      return res.status(404).json({
        message: 'Assigned user not found'
      });
    }

    // Update fields
    report.priority = priority || report.priority;
    report.assignedTo = assignee._id;
    report.status = 'ASSIGNED';

    await report.save();

    //Notification
		await notify ({
			user: assignee,
			template: Template.reportAssigned(report.trackingId),
			preference: report.notificationPreference
		}).catch(console.error);

    // Invalidate caches
    await redis.del('reports:all');
    await redis.del(`report:${report._id}`);
    await redis.del(`report:tracking:${trackingId}`);

    res.json({
      message: 'Trash report priority and assignee updated successfully',
      report
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};











//PUT  Update status  ID
exports.updateStatus = async (req,res) => {
	try {

		const { status } = req.body;

		//find report
		const report = await Report.findById(req.params.id);

		if(!report)
			return res.status(404).json({ message: 'Report not found'});

		//Accessing must be report assigned to or admin
    	if (
    			report.assignedTo &&
      		report.assignedTo.toString() !== req.user._id.toString() &&
      		req.user.role !== 'admin'
    	) {
      		return res.status(403).json({ message: 'Not authorized, you have to be task assignedTo or admin' });
    	}

		//Allowed status
		const allowedStatus = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
		if (!allowedStatus.includes(status))
    		return res.status(400).json({ message: `Allowed status are ${allowedStatus}`});

    	//Update status
    	report.status = status || report.status;

		await report.save();

		//Notification
		if (status === 'COMPLETED') {
  		const creator = await User.findById(report.createdBy);

  		await notify({
    		user: creator,
    		template: Template.reportCompleted(report.trackingId),
    		preference: report.notificationPreference
  		}).catch(console.error);
		}


		// Invalidate caches

		//Delete or invalidate user's report list
	    await redis.del('reports:all');

	    //Delete or Invalidate the single-report cache
	    await redis.del(`report:${req.params.id}`);

	    res.json({
	      	message: 'Trash report status updated',
	      	report
	    });

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};


//PUT  Update status by trackingId
exports.updateStatusByTrackingId = async (req, res) => {
	try {
		const { status } = req.body;
		const { trackingId } = req.params;

		// find report by trackingId
		const report = await Report.findOne({ trackingId });

		if (!report)
			return res.status(404).json({ message: 'Report not found' });

		// Accessing must be assignedTo or admin
		if (
			report.assignedTo &&
			report.assignedTo.toString() !== req.user._id.toString() &&
			req.user.role !== 'admin'
		) {
			return res.status(403).json({
				message: 'Not authorized, you have to be task assignedTo or admin'
			});
		}

		// Allowed status
		const allowedStatus = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
		if (!allowedStatus.includes(status))
			return res.status(400).json({
				message: `Allowed status are ${allowedStatus}`
			});

		// Update status
		report.status = status;

		await report.save();

		//Notification
		if (status === 'COMPLETED') {
  		const creator = await User.findById(report.createdBy);

  		await notify({
    		user: creator,
    		template: Template.reportCompleted(report.trackingId),
    		preference: report.notificationPreference
  		}).catch(console.error);
		}

		// Invalidate caches
	
		await redis.del(`report:${report._id}`); //  _id for single-report cache
		await redis.del(`report:tracking:${report.trackingId}`);

		res.json({
			message: 'Trash report status updated',
			report
		});

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};



//DELETE  Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report)
      return res.status(404).json({ message: 'Report not found' });

    await redis.del('reports:all');
    await redis.del(`report:${req.params._id}`);

    res.json({ message: 'Trash report deleted' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET reports assigned to logged in worker
exports.getAssignedReports = async (req, res) => {
  try {

    const reports = await Report.find({
      assignedTo: req.user.id
    }).sort({ createdAt: -1 });

    res.json(reports);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.markReportComplete = async (req, res) => {
  try {

    const report = await Report.findById(req.params.id);

    if (!report)
      return res.status(404).json({ message: 'Report not found' });

    if (report.assignedTo.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your task' });

    report.status = 'COMPLETED';

    await report.save();

    res.json(report);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET REPORT STATS (Admin)
exports.getReportStats = async (req, res) => {
  try {

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // This month reports
    const thisMonthReports = await Report.countDocuments({
      createdAt: { $gte: startOfThisMonth }
    });

    // Last month reports
    const lastMonthReports = await Report.countDocuments({
      createdAt: {
        $gte: startOfLastMonth,
        $lt: startOfThisMonth
      }
    });

    const percentChange = lastMonthReports === 0
      ? 100
      : (((thisMonthReports - lastMonthReports) / lastMonthReports) * 100).toFixed(1);

    const totalActive = await Report.countDocuments({
      status: { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
    });

    const pending = await Report.countDocuments({ status: 'PENDING' });

    const inProgress = await Report.countDocuments({ status: 'IN_PROGRESS' });

    res.json({
      totalActive,
      thisMonthReports,
      lastMonthReports,
      percentChange,
      pending,
      inProgress
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
