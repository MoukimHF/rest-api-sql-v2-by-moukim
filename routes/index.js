const express = require('express');
const Sequelize = require('sequelize');
const User = require('../models').User;
const Course = require('../models').Course;
const { check, validationResult } = require('express-validator/check');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const colors = require('colors/safe');
const router = express.Router();

function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next)
      } catch(error){
        res.status(500).send(error);
      }
    }
}
router.get('/',(req,res,next)=>{
    res.json({
        message:"hello into the api route"
    })
})

const users = [];

const authenticateUser = (req, res, next) => {
    let message = null;
  
    // Get the user's credentials from the Authorization header.
    const credentials = auth(req);
    console.log(colors.yellow(auth(req)))
    if (credentials) {
      // Look for a user whose `username` matches the credentials `name` property.
      const user = users.find(u => u.emailAddress === credentials.name);
        console.log(colors.green(user))
        console.log(colors.red(users));
      if (user) {
        const authenticated = bcryptjs
          .compareSync(credentials.pass, user.password);
        if (authenticated) {
          console.log(`Authentication successful for username: ${user}`);
  
          // Store the user on the Request object.
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.username}`;
        }
      } else {
        message = `User not found for username: ${credentials.name}`;
      }
    } else {
      message = 'Auth header not found';
    }
  
    if (message) {
      console.warn(message);
      res.status(401).json({ message: 'Access Denied' });
    } else {
      next();
    }
  };
 
router.get('/users',authenticateUser, asyncHandler(async (req, res,next) => {
    const user = req.currentUser;
    console.log(colors.red(user))
    res.json({
       firstName:user.firstName,
       lastName:user.lastName,
       emailAddress:user.emailAddress,
       password:user.password
        
      });
      return res.status(200).end();

  }));
    router.post('/users', [
        check('firstName')
          .exists({ checkNull: true, checkFalsy: true })
          .withMessage('Please provide a value for "firstName"'),
        check('lastName')
          .exists({ checkNull: true, checkFalsy: true })
          .withMessage('Please provide a value for "lastName"'),
        check('emailAddress')
          .exists({ checkNull: true, checkFalsy: true })
          .withMessage('Please provide a value for "password"'),
           check('password')
          .exists({ checkNull: true, checkFalsy: true })
          .withMessage('Please provide a value for "password"'),
      ], asyncHandler(async (req,res,next)=>{
        // Attempt to get the validation result from the Request object.
        const errors = validationResult(req);
      
        // If there are validation errors...
        if (!errors.isEmpty()) {
          // Use the Array `map()` method to get a list of error messages.
          const errorMessages = errors.array().map(error => error.msg);
      
          // Return the validation errors to the client.
          return res.status(400).json({ errors: errorMessages });
        }
  // Get the user from the request body.
  const user = req.body;
  console.log('2')
console.log(user)
console.log('3')
  // Hash the new user's password.
  user.password = bcryptjs.hashSync(user.password);
console.log(colors.zebra(user.password))
  // Add the user to the `users` array.

  console.log(colors.red(users));


    const newUser =User.build({ firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAddress: req.body.emailAddress,
        password: user.password,
    });
    users.push(newUser);
    
    await newUser.save();
    res.location = '/';
    console.log(res.location)

    return res.status(201).end();

  }));


  router.get('/courses',asyncHandler(async (req,res,next)=>{
    const courses =  await Course.findAll({
       
      })
    res.json({
     courses
      });
      return res.status(200).end();
  }));
  
  router.get('/courses/:id',asyncHandler(async (req,res,next)=>{
    const course =  await Course.findOne({
        where:{
            id:req.params.id
        }
       });
    
       console.log(course)
           
      
      if(course!=null){
        const owner = await User.findOne({
            where:{
                id:course.dataValues.userId
            }
        });
            res.json({
            course,
            owner
            })
           
        }
      else {

        res.status(404).json({message: "Course not found."});
}
  }));

  const checkCourse = [
    check('title')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check('description')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"')
  ];
  router.post('/courses',authenticateUser,checkCourse,asyncHandler(async (req,res,next)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        const errorMessages = errors.array().map(error => error.msg);


        return res.status(400).json({ errors: errorMessages });
  }
    const course =Course.build({ 
        title : req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        userId:req.body.userId
    });
    await course.save();
    res.location = `/courses/${course.id}`;
    console.log(res.location)
    return res.status(201).end();

  }));
 
  router.put('/courses/:id',authenticateUser,checkCourse,asyncHandler(async (req,res,next)=>{
 
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        const errorMessages = errors.array().map(error => error.msg);


        return res.status(400).json({ errors: errorMessages });
  }
 await Course.findOne({where: {id:req.params.id}})
.then(record => {

  if (!record) {
    throw new Error('No Course found')
  }

  console.log(`retrieved Course ${JSON.stringify(record,null,2)}`) 

  let values = {
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId:req.body.userId
  };

   record.update(values).then( updatedRecord => {
    console.log(`updated Course ${JSON.stringify(updatedRecord,null,2)}`)
    // login into your DB and confirm update
  })

})
.catch((error) => {
  // do seomthing with the error
  res.json({message:error.message})
})
    
    return res.status(204).end();


}));


router.delete('/courses/:id',authenticateUser,asyncHandler(async (req,res,next)=>{

    await Course.findOne({where: {id:req.params.id}})
   .then(record => {
   
     if (!record) {
       throw new Error('No Course found')
     }
   
     console.log(`retrieved Course ${JSON.stringify(record,null,2)}`) 
   
     
   
      record.destroy().then( deletedCourse => {
       console.log(`deleted Course ${JSON.stringify(deletedCourse,null,2)}`)
       // login into your DB and confirm update
     })
   
   })
   .catch((error) => {
     // do seomthing with the error
     res.json({message:error.message})
   })
       
       return res.status(204).end();
   
   
   }));
  module.exports = router;
