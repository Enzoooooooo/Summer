const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    numberOfPeople: { type: Number, required: true },
    city: { type: String, required: true },
    budget: { type: Number, required: true },
});


const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
