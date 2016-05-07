var express = require('express');
var router = express.Router();
require('dotenv').config();

var Q = require('q');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gbmf');
var gbmfImage = require("../models/gbmfImage").gbmfImage;
var db = mongoose.connection;

var Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: process.env.FLICKR_KEY,
      secret: process.env.FLICKR_SECRET,
      user_id: process.env.FLICKR_USER_ID,
      access_token: process.env.FLICKR_ACCESS_TOKEN,
      access_token_secret: process.env.FLICKR_ACCESS_TOKEN_SECRET,
    };

db.on('error', function() {
  console.error.bind(console, 'connection error:')
});

db.once('open', function() {
  // we're connected!
  Flickr.authenticate(flickrOptions, function(error, flickr) {
    function getPhotosFromPhotoset(photosetId, userId) {
      return Q.Promise(function(resolve, reject) {
        flickr.photosets.getPhotos({
          photoset_id: photosetId,
          user_id: userId
        }, function(err, result) {
          if (err) {
            reject(new Error("Error:" + err));
          }

          resolve(result.photoset.photo);
        })
      });
    };

    function getLocationFromPhotoId(photoId) {
      return Q.Promise(function(resolve, reject) {
        flickr.photos.geo.getLocation({
          photo_id: photoId
        }, function(err, result) {
          if (err) {
            reject(new Error("Error:" + err));
          }

          var location = result.photo.location;
          var returnLocation = {};
          if (!!location) {
            returnLocation = {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
          resolve(returnLocation);
        });
      });
    };

    function getDateFromPhotoId(photoId) {
      return Q.Promise(function(resolve, reject) {
        flickr.photos.getInfo({
          photo_id: photoId
        }, function(err, result) {
          if (err) {
            reject(new Error("Error:" + err));
          }

          // console.log(result);

          var date = result.photo.dates.taken;
          var returnDate = '';
          if (!!date) {
            // date = new Date(date);
            // returnDate = {
            //   year: date.year,
            //   month: date.month,
            //   day: date.day
            // }
            returnDate = date;
          }

          resolve(returnDate);
        });
      });
    };

    function getSrcFromPhotoId(photoId, preferredSize) {
      return Q.Promise(function(resolve, reject) {
        flickr.photos.getSizes({
          photo_id: photoId
        }, function(err, result) {
          if (err) {
            reject(new Error("Error:" + err));
          }

          var defaultSize = 'Medium';
          preferredSize = preferredSize || defaultSize;

          // see if preferred size is in given sizes
          result.sizes.size.forEach(function(size, index) {
            if (size.label === preferredSize) {
              resolve(size.source);
            }
          });

          // if not found, return last (highest res) size
          resolve(result.sizes.size[result.sizes.size.length - 1].source);
        });
      });
    };

    function getPhotoInfo(photoId) {
      return Q.Promise(function(resolve, reject) {
        flickr.photos.getInfo({
          photo_id: photoId
        }, function(err, result) {
          if (err) {
            reject(new Error("Error:" + err));
          }

          var photo = result.photo;

          resolve({
            id: photo.id,
            location: {
              latitude: photo.location.latitude,
              longitude: photo.location.longitude
            },
            date: photo.dates.taken,
            url: photo.urls.url[0]._content,
          });
        });
      });
    };

    if (error) {
      console.log('error:', error);
    }

    // we can now use "flickr" as our API object
    var gbmfAlbumId = '72157632455775153';
    getPhotosFromPhotoset(gbmfAlbumId, process.env.FLICKR_USER_ID)
      .then(function(photos) {
        if (photos && photos.length > 0) {
          // console.log(photos);
          photos.forEach(function(photo, index) {
            gbmfImage.find({ id: photo.id})
              .then(function(result) {
                if (result.length == 0) {
                  // console.log('adding new image with id', photo.id);
                  var newPhoto = {};

                  getPhotoInfo(photo.id)
                    .then(function(photo) {
                      newPhoto = photo;
                    })
                    .then(function() {
                      return getSrcFromPhotoId(photo.id)
                        .then(function(src) {
                          newPhoto.src = src;
                        })
                      })
                    .catch(function(err) {
                      console.log('getLocationFromPhotoId error:', err);
                    })
                    .finally(function() {
                      // console.log('attempting to save', newPhoto);
                      newPhotoRecord = new gbmfImage(newPhoto);
                      newPhotoRecord.save(function(err) {
                        if (err) {
                          console.log('error saving:', err);
                        } else {
                          console.log('saved:', newPhoto);
                        }
                      });
                    });
                } else {
                  // console.log('record found:', result);
                }
              })
          });
        }
      })
      .catch(function(err) {
        console.log('getPhotosFromPhotoset err:', err)
      })
      .finally(function() {
        gbmfImage.find({}).lean()
          .then(function(images) {
            router.get('/', function (req, res, next) {
              res.render('gbmf', {
                title: 'gbmf',
                header: 'ground beneath my feet',
                images: images
              });
            });
          })
      })
  });
});
//
//
// /* GET gbmf page. */
// router.get('/', function (req, res, next) {
//   res.render('gbmf', {
//     title: 'gbmf',
//     data: {'foo': 'bar'}
//   });
// });

module.exports = router;
