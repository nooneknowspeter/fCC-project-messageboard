'use strict';
const BoardModel = require("../models/board-model").BoardModel;
const ReplyModel = require("../models/reply-model").ReplyModel;
const ThreadModel = require("../models/thread-model").ThreadModel;

module.exports = function (app) {
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
