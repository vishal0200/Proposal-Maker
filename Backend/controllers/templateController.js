import Template from "../models/Template.js";

// Fetch user templates + global system templates
export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({
      $or: [{ user: req.user._id }, { isGlobal: true }],
    }).sort({ createdAt: -1 });

    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, category, description, defaultSections } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Template name is required." });
    }

    const template = await Template.create({
      user: req.user._id,
      name,
      category,
      description,
      defaultSections: defaultSections || [],
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};