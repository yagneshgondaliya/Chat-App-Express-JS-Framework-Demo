//Import required libraries and models
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models').User;
const jwt = require('jsonwebtoken');

//Show register page
router.get('/register',(req,res)=>{
    res.render('register');
});

//Show login page
router.get('/login',(req,res)=>{
    res.render('login');
});

//Post route to register user
router.post('/register',async (req,res)=>{
    
    //Destructuring user data
    const {name,email,password} = req.body;
    
    //Generating salt for hashing
    const salt = await bcrypt.genSalt(10); 
    const hashPassword = await bcrypt.hash(password,salt);

    //Create User
    const createUser = await User.create({name,email,password:hashPassword});
    res.redirect('login'); //Redirect to login page after registration
});

router.post('/login',async(req,res)=>{
    
    //Destructuring user data
    const {email,password} = req.body

    //Get user based on email
    const getUser = await User.findOne({where:{email:email},attributes:['id','email','password']});
    if(!getUser){
        return res.status(400).json({status:false,message:"Please enter correct credentials!"});
    }
    //Validate password
    const validatePassword = await bcrypt.compare(password,getUser.password);
    if(!validatePassword) return res.status(400).json({status:false,message:"Please enter correct credentials!"});

    //Generate token
    //SECRET is static but should be fetched from env files
    const token  = jwt.sign({id:getUser.id},"SECRET",{expiresIn:'30d'}); 

    //Add token into cookie variable and send it to the browser
    res.cookie('session',token,{expiresIn:30*24*60*60});
    res.redirect('/home'); //redirect to home
});

module.exports = router;