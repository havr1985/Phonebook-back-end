const Contact = require('../models/contacts');

const { HttpError } = require('../helpers');
const { ctrlWrapper } = require('../decorators');

const listContacts = async (req, res) => {
    const { _id: owner } = req.user;
    const { page = 1, limit = 20, favorite, ...filterParams } = req.query;
    const skip = (page - 1) * limit;
    const filter = favorite ? { owner, favorite, ...filterParams } : {owner, ...filterParams};
    const result = await Contact.find(filter, '-createdAt -updatedAt', { skip, limit }).populate('owner', 'email');
    const total = await Contact.countDocuments(filter);
    res.json({
        result,
        total
    });
};

const getContactById = async (req, res) => {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOne({ _id: contactId, owner });
    if (!result) {
        throw HttpError(404, 'Not found');
    }
    res.json(result)
};

const addContact = async (req, res) => {
    const { _id: owner } = req.user;
    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
};

const removeContact = async (req, res) => {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndDelete({ _id: contactId, owner });
    if (!result) throw HttpError(404, 'Not found');
    res.json({ message: 'contact deleted' });
};

const updateContact = async (req, res) => {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndUpdate({ _id: contactId, owner }, req.body, {new: true});
    if (!result) throw HttpError(404, 'Not found');
    res.json(result);
};

const updateFavorite = async (req, res) => {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndUpdate({ _id: contactId, owner }, req.body, {new: true});
    if (!result) throw HttpError(404, 'Not found');
    res.json(result);
};

module.exports = {
    listContacts: ctrlWrapper(listContacts),
    getContactById: ctrlWrapper(getContactById),
    addContact: ctrlWrapper(addContact),
    removeContact: ctrlWrapper(removeContact),
    updateContact: ctrlWrapper(updateContact),
    updateFavorite: ctrlWrapper(updateFavorite),
}