//Import required packages and models
const express = require('express');
const app = express();
const db = require('./models');
var  fs = require ( 'fs' );
const cookieParser = require('cookie-parser');
const User = require('./models').User;
const Chat = require('./models').Chat;
const socketIO = require('socket.io');
const server = require('http').createServer(app);
const path = require('path');

//Initiate socket io instance
let io = socketIO(server);

//SYNCING DB
db.sequelize.sync().then(()=>{
    console.log("All Model Syncing!");
}).catch((err)=>{
    console.log(err);
});

//USE OF INBUILT MIDDLEWARES
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');
app.set('views',__dirname+"/views");
app.use(express.static(path.join(__dirname,"public")));

//WEB AUTH MIDDLEWARES
const auth = require('./middlewares/auth');
const guest = require('./middlewares/guest');

const authRoutes = require('./routes/auth');
const { Op } = require('sequelize');

// Call for home page with auth middleware
app.get('/home',auth,async (req,res)=>{
    const users = await User.findAll({
        where:{id:{
            [Op.ne]:req.user_id
        }
    },
    attributes:{
        exclude:['password']
    }
});
res.render('home',{users,user_id:req.user_id});
});

//Get chats between sender and reciever
app.get('/get-myChats/:id/:limit?',auth,async(req,res)=>{
    
    const loggedUserId = req.user_id;
    var offset = 0;
    var limit;
    if(req.params.limit == undefined){
        limit = 10
    }else{
        limit = parseInt(req.params.limit)
    }
    const chats = await Chat.findAll({
        offset,
        limit,
        where:{
            [Op.and]:[{
                userId:[loggedUserId,req.params.id]
            },{
                recieverId:[loggedUserId,req.params.id]
            }]  
        },
        include:{
            model:User,
            attributes:['id','name']
        },
        order:[['createdAt','DESC']]
    });
    
    return res.status(200).json({status:true,chats});
    
});

//Call for auth routes with guest middleware which will redirect authenticate user to auth routes
app.use('/',guest,authRoutes);

// Global variable to store user ids and thier socket id connection
var user_ids = [];

// SOCKET CODE STARTS

//Running socket events on connection
io.on('connection', (socket) => {
    var socketId = socket.id;
    console.log('connection',socketId);
    console.log('user IDs',user_ids);
    
    //Event starts when user logs in
    socket.on('userLoggedIn',(user_id)=>{
        //check for existing user
        let index = user_ids.findIndex(data => data.user_id === user_id);
        if (index !== -1) {
            user_ids.splice(index, 1);
            user_ids.push({user_id,socketId:socket.id});
            
        }else{
            user_ids.push({user_id,socketId:socket.id});
        }
        
        console.log(user_ids);
        
        //Emits event to frontend to show which users are online.
        io.sockets.emit('getLoggedInUsers', user_ids); 
    });
    
    //Event called whne user messages another user
    socket.on('onMessage',async (data)=>{
        console.log(data,"hashjs fgdjsgf j");
        const createChat = await Chat.create(data);
        var userId = data.userId;
        var recieverId = data.recieverId;
        
        //Get backend data for user name
        const user = await User.findOne({where:{id:userId},attributes:['id','name']});
        const reciever = await User.findOne({where:{id:recieverId},attributes:['id','name']});
        var recieverMsgData;
        // recieverMsgData = {name:reciever.name,message:data.message,recieverId,newMessage:1};
        const userMsgData = {name:user.name,message:data.message,recieverId};
        recieverMsgData = {name:user.name,message:data.message,userId};
        
        //To check if the message sent to to user is offline or online
        const getRecieverSocketId = user_ids.find(data=>{
            if(data.user_id == recieverId){
                return true;
            }else{
                return false;
            }
        })
        console.log(getRecieverSocketId);
        //Sends message to only logged in user.
        socket.emit('recieveSenderChatFromServer',(userMsgData))
        if(getRecieverSocketId != undefined){
            socket.to(getRecieverSocketId.socketId).emit('recieveReciverChatFromServer',(recieverMsgData))
        }
        
    });
    
    socket.on('disconnecting',()=>{
        let index = user_ids.findIndex(data => data.socketId === socketId);
        var disconnect_user_id;
        if (index !== -1) {
            disconnect_user_id = user_ids[index].user_id;
            user_ids.splice(index, 1);
        }
        io.emit('onUserDisconnection',disconnect_user_id);
    });
    
});
// SOCKET STARTS ENDS

server.listen(4000);