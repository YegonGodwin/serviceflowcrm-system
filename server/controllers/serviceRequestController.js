import ServiceRequest from '../models/ServiceRequest.js';
import Invoice from '../models/Invoice.js';

export const createServiceRequest = async (req, res) => {
    const { title, description, priority } = req.body;

    const serviceRequest = await ServiceRequest.create({
        client: req.user._id,
        title,
        description,
        priority,
    });

    if (serviceRequest) {
        res.status(201).json(serviceRequest);
    } else {
        res.status(400).json({ message: 'Invalid service request data' });
    }
};

export const getServiceRequests = async (req, res) => {
    let query = {};
    if (req.user.role === 'client') {
        query.client = req.user._id;
    } else if (req.user.role === 'employee') {
        query.assignedTo = req.user._id;
    }

    const serviceRequests = await ServiceRequest.find(query).populate('client', 'name email companyName').populate('assignedTo', 'name email position');
    res.json(serviceRequests);
};

export const getServiceRequestById = async (req, res) => {
    const serviceRequest = await ServiceRequest.findById(req.params.id).populate('client', 'name email companyName').populate('assignedTo', 'name email position');

    if (serviceRequest) {
        res.json(serviceRequest);
    } else {
        res.status(404).json({ message: 'Service request not found' });
    }
};

export const updateServiceRequestStatus = async (req, res) => {
    const { status, assignedTo, scheduledDate, completionDate, cost } = req.body;

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (serviceRequest) {
        const previousStatus = serviceRequest.status;
        serviceRequest.status = status || serviceRequest.status;
        serviceRequest.assignedTo = assignedTo || serviceRequest.assignedTo;
        serviceRequest.scheduledDate = scheduledDate || serviceRequest.scheduledDate;
        serviceRequest.completionDate = completionDate || (status === 'completed' ? new Date() : serviceRequest.completionDate);
        serviceRequest.cost = cost || serviceRequest.cost;

        const updatedServiceRequest = await serviceRequest.save();

        // Automatically create an invoice if status changed to 'completed'
        if (status === 'completed' && previousStatus !== 'completed') {
            const invoiceExists = await Invoice.findOne({ serviceRequest: updatedServiceRequest._id });
            
            if (!invoiceExists) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

                await Invoice.create({
                    client: updatedServiceRequest.client,
                    serviceRequest: updatedServiceRequest._id,
                    invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    amount: updatedServiceRequest.cost || 0,
                    dueDate,
                    status: 'unpaid',
                });
            }
        }

        res.json(updatedServiceRequest);
    } else {
        res.status(404).json({ message: 'Service request not found' });
    }
};