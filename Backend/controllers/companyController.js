import Company from "../models/Company.js";

export const getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return res.status(404).json({ message: "Company details not configured yet." });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateCompany = async (req, res) => {
  try {
    const { name, logoUrl, email, phone, address, taxId } = req.body;

    let company = await Company.findOne({ user: req.user._id });

    if (company) {
      company = await Company.findOneAndUpdate(
        { user: req.user._id },
        { name, logoUrl, email, phone, address, taxId },
        { new: true, runValidators: true }
      );
      return res.status(200).json({ message: "Company updated!", company });
    }

    company = await Company.create({
      user: req.user._id,
      name,
      logoUrl,
      email,
      phone,
      address,
      taxId,
    });

    res.status(201).json({ message: "Company created!", company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};