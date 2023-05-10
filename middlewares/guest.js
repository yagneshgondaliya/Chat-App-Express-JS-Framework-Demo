function guest(req,res,next){
    const token = req.cookies.session;
    if(token){
        return res.redirect('/login');
    }else{
        next();
    }
}
module.exports = guest;