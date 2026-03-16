import Contract from '../models/Contract.js';

export const createContract = async (req, res) => {
    try {
        const { client, title, amount, startDate, endDate, terms, paymentFrequency } = req.body;

        const contract = await Contract.create({
            client,
            title,
            amount,
            startDate,
            endDate,
            terms,
            paymentFrequency,
        });

        if (contract) {
            res.status(201).json(contract);
        } else {
            res.status(400).json({ message: 'Invalid contract data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getContracts = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'client') {
            query.client = req.user._id;
        }

        const contracts = await Contract.find(query).populate('client', 'name email companyName');
        res.json(contracts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateContract = async (req, res) => {
    try {
        const { status, endDate, amount } = req.body;

        const contract = await Contract.findById(req.params.id);

        if (contract) {
            contract.status = status || contract.status;
            contract.endDate = endDate || contract.endDate;
            contract.amount = amount || contract.amount;

            const updatedContract = await contract.save();
            res.json(updatedContract);
        } else {
            res.status(404).json({ message: 'Contract not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const signContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);

        if (contract) {
            // Log to help debug if it fails (not visible to user but good practice)
            console.log(`Signing contract ${req.params.id} for user ${req.user._id}`);
            console.log(`Contract client ID: ${contract.client}`);

            // Ensure ownership - using .equals() for ObjectIds is safer in some Mongoose versions
            if (contract.client.toString() !== req.user._id.toString()) {
                return res.status(403).json({ 
                    message: 'Unauthorized to sign this contract',
                    debug: { contractClient: contract.client, user: req.user._id }
                });
            }

            if (contract.status !== 'pending') {
                return res.status(400).json({ message: 'Only pending contracts can be signed' });
            }

            contract.status = 'active';
            contract.signedAt = new Date();

            const updatedContract = await contract.save();
            res.json(updatedContract);
        } else {
            res.status(404).json({ message: 'Contract not found' });
        }
    } catch (error) {
        console.error("Sign Contract Error:", error);
        res.status(500).json({ message: error.message });
    }
};
