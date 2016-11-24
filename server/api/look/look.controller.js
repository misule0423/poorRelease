'use strict';

var _ = require('lodash');
var Look = require('./look.model');
var path = require('path');
var express = require('express');
var utils = require('../../utils/utils.js');

exports.allLooks = function(req, res) {
  Look.find({lookStatus :0})
    .sort({
      createTime: -1,
    })
    .exec(function(err, looks) {
      if (err) {
        return handleError(res, err);
      }
      if (!looks) {
        return res.send(404);
      }
      console.log(looks);
      return res.status(200)
                     .json(looks);
    });
};

exports.answeredLooks = function(req, res) {
  Look.find({lookStatus :1})
    .sort({
      createTime: -1,
    })
    .exec(function(err, looks) {
      if (err) {
        return handleError(res, err);
      }
      if (!looks) {
        return res.send(404);
      }
      console.log(looks);
      return res.status(200)
                     .json(looks);
    });
};


exports.userLooks = function(req, res) {
  var userEmail = req.query.email;
  Look.find({
    email: {
      $in: userEmail
    }
  })
  .sort({
    createTime: -1
  })
  .exec(function(err, looks) {
    if(err) {
      return handleError(res, err);
    }
    console.log(looks);
    return res.status(200)
                   .json(looks);
  });
};

exports.scrapeUpload = function(req, res) {
  var random = utils.randomizer(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

  utils.downloadURI(req.body.image, './client/assets/images/uploads/' + random + '.png', function(filename) {
    console.log('done');

    var newLook = new Look();
    newLook.title = req.body.title;
    newLook.image = filename.slice(9);
    newLook.email = req.body.email;
    newLook.linkURL = req.body.linkURL;
    newLook.description = req.body.description;
    newLook.userName = req.body.name;
    newLook._creator = req.body._creator;
    newLook.createTime = Date.now();
    newLook.upVotes = 0;
    newLook.save(function(err, item) {
      if (err) {
        console.log('error occured in saving post');
      } else {
        console.log('Success post saved');
        console.log(item);
        res.status(200)
          .json(item);
      }
    });
  });
}

exports.upload = function(req, res) {
  var newLook = new Look();
  var fileimage = req.middlewareStorage.fileimage;

  console.log("start point!!!!!!!");
  console.log(req.middlewareStorage);
  console.log("end point!!!!!!!");

  console.log(req.body);
  newLook.image = '/assets/images/uploads/' + fileimage;
  newLook.email = req.body.email;
  // newLook.linkURL = req.body.linkURL;

  newLook.gender = req.body.gender;
  newLook.description = req.body.description;
  newLook.size = req.body.size;
  newLook.color = req.body.color;
  newLook.userName = req.body.name;
  newLook.userGravatar = req.body.gravatar;
  newLook._creator = req.body._creator;
  newLook.createTime = Date.now();
  newLook.upVotes = 0;

  newLook.save(function(err, look) {
    if(err) {
      console.log('error saving look');
      return res.send(500);
    } else {
      console.log(look);
      res.status(200)
           .send(look);
    }
  });
};

exports.singleLook = function(req, res) {
  Look.findById(req.params.lookId, function(err, look) {
    if(err) {
      return handleError(res, err);
    }
    if(!look) {
      return res.send(404);
    }
    return res.json(look);
  });
};

exports.popLooks = function(req, res) {
  Look.find(req.params.id)
    .sort('-upVotes')
    .limit(6)
    .exec(function(err, looks) {
      if (err) {
        return handleError(res, err);
      }
      console.log(looks);
      return res.json(looks);
    });
}

exports.update = function(req, res) {

  console.log("hihihihihihihi");
  console.log(req.body);

  if(req.body._id) {
    delete req.body._id;
  }
  Look.findById(req.params.id, function(err, look) {
    if(err) {
      return handleError(res, err);
      }
      if(!look) {
        return res.send(404);
      }
      var updated = _.merge(look, req.body);

      updated.lookStatus = 1;
      updated.ansBrandname = req.body.ansBrandname;
      updated.ansDescription = req.body.ansDescription;
      updated.size = req.body.ansSize;
      updated.ansSex = req.body.ansSex;
      updated.ansColor = req.body.ansColor;
      updated.ansPrice = req.body.ansPrice;
      updated.ansTag = req.body.ansTag;
      updated.ansLink = req.body.ansLink;

      updated.save(function(err) {
        if(err) {
          return handleError(res, err);
        }

        console.log(look);
        return res.json(look);
      });
  });
};

exports.delete = function(req, res) {
  Look.findById(req.params.id, function(err, look) {
    if(err) {
      return handleError(res, err);
    }
    if(!look) {
      return res.send(404);
    }
    look.remove(function(err) {
      if(err) {
        return handleError(res, err);
      }
      return res.send(200);
    });
  });
};

exports.addView = function(req, res) {
  Look.findById(req.params.id, function(err, look) {
    if(err) {
      return handleError(res, err);
    }
    if (!look) {
      return res.send(404);
    }
    look.views++;
    look.save(function(err) {
      if (err) {
        return handle(res, err);
      }
      return res.json(look);
    });
  });
};

exports.addUpvote = function(req, res) {
  Look.findById(req.params.id, function(err, look) {
    if(err) {
      return handleError(res, err);
    }
    if(!look) {
      return res.send(404);
    }
    look.upVotes++;
    look.save(function(err) {
      if(err) {
        return handleError(res, err);
      }
      return res.json(look);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}