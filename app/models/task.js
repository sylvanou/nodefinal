// load the things we need
var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
  email: { type: String, lowercase: true, trim: true },
  task: { type: String, trim: true },
  taskBody: { type: String, trim: true },
});

module.exports = Task = mongoose.model('Task', taskSchema);