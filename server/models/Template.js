const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: String,
  frameColor: String,
  backgroundGradient: String,
  stickerSet: [String],
  layout: Object
});

module.exports = mongoose.model('Template', TemplateSchema);
