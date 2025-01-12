const mongoose = require('mongoose');
const LogSchema = require('./schemas/LogSchema');
const UserSchema = require('./schemas/UserSchema');
const AlertSchema = require('./schemas/AlertSchema');

// Create models only if they haven't been compiled yet
const models = {
  Log: mongoose.models.Log || mongoose.model('Log', LogSchema),
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Alert: mongoose.models.Alert || mongoose.model('Alert', AlertSchema)
};

module.exports = models; 