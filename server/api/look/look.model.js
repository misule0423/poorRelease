'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LookSchema = new Schema({
  image: String,
  linkURL: String,
  // title: String,
  gender:String,
  description: String,
  size: Number,
  color: String,
  location: String,
  _creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  email: String,
  userName: String,
  userGravatar: String,
  createTime: {
    type: Date,
    'default': Date.now
  },
  lookStatus: {
    type: Number,
    'default': 0
  },
  views: {
    type: Number,
    'default': 0
  },
  upVotes: {
    type: Number,
    'default': 0
  },

  ansBrandname: String,
  ansDescription: String,
  ansSize: String,
  ansSex: String,
  ansColor: String,
  ansPrice: Number,
  ansTag: String,
  ansLink: String

});

module.exports = mongoose.model('Look', LookSchema);