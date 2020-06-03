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

const authenticateUser = asyncHandler(async(req, res, next) => {
    let message = null;
    const utilisateurs = await User.findAll({
      attributes: { exclude: ['createdAt','updatedAt'] }

    });
    // Get the user's credentials from the Authorization header.
    const credentials = auth(req);
    if (credentials) {
      // Look for a user whose `username` matches the credentials `name` property.
      const user = utilisateurs.find(u => u.emailAddress === credentials.name);
       
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
  });
 
router.get('/users',authenticateUser, asyncHandler(async (req, res,next) => {
    const user = req.currentUser;
    res.json({
       firstName:user.firstName,
       lastName:user.lastName,
       emailAddress:user.emailAddress,
      
        
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
        try{
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
  // Hash the new user's password.
  user.password = bcryptjs.hashSync(user.password);
    const newUser =User.build({ firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAddress: req.body.emailAddress,
        password: user.password,
    });
    
    await newUser.save();
    res.location('/')
    console.log(res.location)

     res.status(201).end();
    }catch(e) {
      const messages = {};
     console.log(e.errors)
          e.errors.forEach((error) => {
              let message;
              switch (error.validatorKey) {
                  case 'isEmail':
                      message = 'Please enter a valid email';
                      break;
                  case 'is_null':
                      message = 'Please complete this field';
                      break;
                  case 'not_unique':
                      message = error.value + ' is taken. Please choose another one';
                      error.path = error.path.replace("_UNIQUE", "");
              }
              console.log(error.path)
              messages[error.path] = message;
          });
          res.status(400).json({message:messages})
      }
  
  }));


  router.get('/courses',asyncHandler(async (req,res,next)=>{
    // const courses =  await Course.findAll({});
    const courses = await Course.findAll({
      attributes: { exclude: ['createdAt','updatedAt'] },
        include: [
          {
            model: User,
            
            attributes: { exclude: ['password','createdAt','updatedAt'] }
          }
        ]
      })
    
    res.json({
     courses,
     
      });
       res.status(200).end();


  }));
  
  router.get('/courses/:id',asyncHandler(async (req,res,next)=>{
    const course =  await Course.findOne({
      attributes: { exclude: ['createdAt','updatedAt'] },
        where:{
            id:req.params.id
        }
       });
    
           
      
      if(course!=null){
        const owner = await User.findOne({
          attributes: { exclude: ['createdAt','updatedAt','password'] },

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
    res.location(`/courses/${course.id}`);
    console.log(res.location)
    return res.status(201).end();

  }));
 
  router.put('/courses/:id',authenticateUser,checkCourse,asyncHandler(async (req,res,next)=>{
    console.log(colors.red(req.currentUser))
 
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
 let authorised =  record.userId==req.currentUser.id;
if(authorised==false){
  res.status(403)
  throw new Error('user is not permited to modify this course ')
  
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
     let authorised =  record.userId==req.currentUser.id;
     if(authorised==false){
      res.status(403)
       throw new Error('user is not permited to delete this course ')
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
