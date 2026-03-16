import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = await Setting.create({});
    }
    res.json(settings);
};

export const updateSettings = async (req, res) => {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = new Setting();
    }

    settings.companyName = req.body.companyName || settings.companyName;
    settings.companyEmail = req.body.companyEmail || settings.companyEmail;
    settings.companyPhone = req.body.companyPhone || settings.companyPhone;
    settings.companyAddress = req.body.companyAddress || settings.companyAddress;
    settings.companyWebsite = req.body.companyWebsite || settings.companyWebsite;
    
    if (req.body.departments) {
        settings.departments = req.body.departments;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
};