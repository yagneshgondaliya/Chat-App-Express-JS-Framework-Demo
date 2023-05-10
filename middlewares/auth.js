const jwt = require('jsonwebtoken');
const User = require('../models').User;

async function auth(req,res,next){
    const token = req.cookies.session;        
    
    if(token == undefined) return res.redirect('/login');
    
    const verified = jwt.verify(token,'SECRET');
    if(verified){
        //Getting id from token and check if by chance token is manipulated and wrong id is sent
        const userRole = await User.findOne({where:{
            id:verified.id,
        }});
        
        if(userRole){
            req.user_id = verified.id
            next();
        }
        else{
            res.clearCookie('session');
            res.redirect('/login')
        }
    }else{
        res.redirect('/login');
    }
}

module.exports = auth;