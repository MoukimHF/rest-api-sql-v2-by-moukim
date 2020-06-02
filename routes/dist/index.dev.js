"use strict";

var express = require('express');

var Sequelize = require('sequelize');

var User = require('../models').User;

var Course = require('../models').Course;

var _require = require('express-validator/check'),
    check = _require.check,
    validationResult = _require.validationResult;

var bcryptjs = require('bcryptjs');

var auth = require('basic-auth');

var colors = require('colors/safe');

var router = express.Router();

function asyncHandler(cb) {
  return function _callee(req, res, next) {
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return regeneratorRuntime.awrap(cb(req, res, next));

          case 3:
            _context.next = 8;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context["catch"](0);
            res.status(500).send(_context.t0);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 5]]);
  };
}

router.get('/', function (req, res, next) {
  res.json({
    message: "hello into the api route"
  });
});
var users = [];

var authenticateUser = function authenticateUser(req, res, next) {
  var message = null; // Get the user's credentials from the Authorization header.

  var credentials = auth(req);
  console.log(colors.yellow(auth(req)));

  if (credentials) {
    // Look for a user whose `username` matches the credentials `name` property.
    var user = users.find(function (u) {
      return u.emailAddress === credentials.name;
    });
    console.log(colors.green(user));
    console.log(colors.red(users));

    if (user) {
      var authenticated = bcryptjs.compareSync(credentials.pass, user.password);

      if (authenticated) {
        console.log("Authentication successful for username: ".concat(user)); // Store the user on the Request object.

        req.currentUser = user;
      } else {
        message = "Authentication failure for username: ".concat(user.username);
      }
    } else {
      message = "User not found for username: ".concat(credentials.name);
    }
  } else {
    message = 'Auth header not found';
  }

  if (message) {
    console.warn(message);
    res.status(401).json({
      message: 'Access Denied'
    });
  } else {
    next();
  }
};

router.get('/users', authenticateUser, asyncHandler(function _callee2(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          user = req.currentUser;
          console.log(colors.red(user));
          res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.emailAddress,
            password: user.password
          });
          return _context2.abrupt("return", res.status(200).end());

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}));
router.post('/users', [check('firstName').exists({
  checkNull: true,
  checkFalsy: true
}).withMessage('Please provide a value for "firstName"'), check('lastName').exists({
  checkNull: true,
  checkFalsy: true
}).withMessage('Please provide a value for "lastName"'), check('emailAddress').exists({
  checkNull: true,
  checkFalsy: true
}).withMessage('Please provide a value for "password"'), check('password').exists({
  checkNull: true,
  checkFalsy: true
}).withMessage('Please provide a value for "password"')], asyncHandler(function _callee3(req, res, next) {
  var errors, errorMessages, user, newUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // Attempt to get the validation result from the Request object.
          errors = validationResult(req); // If there are validation errors...

          if (errors.isEmpty()) {
            _context3.next = 4;
            break;
          }

          // Use the Array `map()` method to get a list of error messages.
          errorMessages = errors.array().map(function (error) {
            return error.msg;
          }); // Return the validation errors to the client.

          return _context3.abrupt("return", res.status(400).json({
            errors: errorMessages
          }));

        case 4:
          // Get the user from the request body.
          user = req.body;
          console.log('2');
          console.log(user);
          console.log('3'); // Hash the new user's password.

          user.password = bcryptjs.hashSync(user.password);
          console.log(colors.zebra(user.password)); // Add the user to the `users` array.

          console.log(colors.red(users));
          newUser = User.build({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: user.password
          });
          users.push(newUser);
          _context3.next = 15;
          return regeneratorRuntime.awrap(newUser.save());

        case 15:
          res.location = '/';
          console.log(res.location);
          return _context3.abrupt("return", res.status(201).end());

        case 18:
        case "end":
          return _context3.stop();
      }
    }
  });
}));
router.get('/courses', asyncHandler(function _callee4(req, res, next) {
  var courses;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(Course.findAll({}));

        case 2:
          courses = _context4.sent;
          res.json({
            courses: courses
          });
          return _context4.abrupt("return", res.status(200).end());

        case 5:
        case "end":
          return _context4.stop();
      }
    }
  });
}));
router.get('/courses/:id', asyncHandler(function _callee5(req, res, next) {
  var course, owner;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Course.findOne({
            where: {
              id: req.params.id
            }
          }));

        case 2:
          course = _context5.sent;
          console.log(course);

          if (!(course != null)) {
            _context5.next = 11;
            break;
          }

          _context5.next = 7;
          return regeneratorRuntime.awrap(User.findOne({
            where: {
              id: course.dataValues.userId
            }
          }));

        case 7:
          owner = _context5.sent;
          res.json({
            course: course,
            owner: owner
          });
          _context5.next = 12;
          break;

        case 11:
          res.status(404).json({
            message: "Course not found."
          });

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  });
}));
var checkCourse = [check('title').exists({
  checkNull: true,
  checkFalsy: true
}).withMessage('Please provide a value for "title"'), check('description').exists({
  checkNull: true,
  checkFalsy: true
}).withMessage('Please provide a value for "description"')];
router.post('/courses', authenticateUser, checkCourse, asyncHandler(function _callee6(req, res, next) {
  var errors, errorMessages, course;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          errors = validationResult(req);

          if (errors.isEmpty()) {
            _context6.next = 4;
            break;
          }

          errorMessages = errors.array().map(function (error) {
            return error.msg;
          });
          return _context6.abrupt("return", res.status(400).json({
            errors: errorMessages
          }));

        case 4:
          course = Course.build({
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded,
            userId: req.body.userId
          });
          _context6.next = 7;
          return regeneratorRuntime.awrap(course.save());

        case 7:
          res.location = "/courses/".concat(course.id);
          console.log(res.location);
          return _context6.abrupt("return", res.status(201).end());

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  });
}));
router.put('/courses/:id', authenticateUser, checkCourse, asyncHandler(function _callee7(req, res, next) {
  var errors, errorMessages;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          errors = validationResult(req);

          if (errors.isEmpty()) {
            _context7.next = 4;
            break;
          }

          errorMessages = errors.array().map(function (error) {
            return error.msg;
          });
          return _context7.abrupt("return", res.status(400).json({
            errors: errorMessages
          }));

        case 4:
          _context7.next = 6;
          return regeneratorRuntime.awrap(Course.findOne({
            where: {
              id: req.params.id
            }
          }).then(function (record) {
            if (!record) {
              throw new Error('No Course found');
            }

            console.log("retrieved Course ".concat(JSON.stringify(record, null, 2)));
            var values = {
              title: req.body.title,
              description: req.body.description,
              estimatedTime: req.body.estimatedTime,
              materialsNeeded: req.body.materialsNeeded,
              userId: req.body.userId
            };
            record.update(values).then(function (updatedRecord) {
              console.log("updated Course ".concat(JSON.stringify(updatedRecord, null, 2))); // login into your DB and confirm update
            });
          })["catch"](function (error) {
            // do seomthing with the error
            res.json({
              message: error.message
            });
          }));

        case 6:
          return _context7.abrupt("return", res.status(204).end());

        case 7:
        case "end":
          return _context7.stop();
      }
    }
  });
}));
router["delete"]('/courses/:id', authenticateUser, asyncHandler(function _callee8(req, res, next) {
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(Course.findOne({
            where: {
              id: req.params.id
            }
          }).then(function (record) {
            if (!record) {
              throw new Error('No Course found');
            }

            console.log("retrieved Course ".concat(JSON.stringify(record, null, 2)));
            record.destroy().then(function (deletedCourse) {
              console.log("deleted Course ".concat(JSON.stringify(deletedCourse, null, 2))); // login into your DB and confirm update
            });
          })["catch"](function (error) {
            // do seomthing with the error
            res.json({
              message: error.message
            });
          }));

        case 2:
          return _context8.abrupt("return", res.status(204).end());

        case 3:
        case "end":
          return _context8.stop();
      }
    }
  });
}));
module.exports = router;