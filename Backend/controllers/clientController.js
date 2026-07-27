import Client from "../models/Client.js";

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Client name and email are required." });
    }

    const client = await Client.create({
      user: req.user._id,
      name,
      contactPerson,
      email,
      phone,
      address,
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) return res.status(404).json({ message: "Client not found." });

    res.status(200).json({ message: "Client deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};