module.exports = function () {
  var mongoose = require('mongoose');
  var mongo = mongoose.connect('mongodb://localhost/todo');
  return mongo;
}