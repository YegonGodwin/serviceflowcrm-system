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
        const { signatureData } = req.body;

        if (!signatureData) {
            return res.status(400).json({ message: 'Signature is required to sign the contract' });
        }

        const contract = await Contract.findById(req.params.id);

        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        if (contract.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to sign this contract' });
        }

        if (contract.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending contracts can be signed' });
        }

        contract.status = 'active';
        contract.signedAt = new Date();
        contract.signature = signatureData; // base64 PNG from canvas

        const updatedContract = await contract.save();
        res.json(updatedContract);
    } catch (error) {
        console.error("Sign Contract Error:", error);
        res.status(500).json({ message: error.message });
    }
};
