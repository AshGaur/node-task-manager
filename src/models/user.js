const mongoose=require('mongoose')
const validator=require('validator')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
require('../db/mongoose')
const Task = require('./task-model')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email not Valid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
    },
    avatar:{
        type:Buffer
    },
    tokens:[
        {
            token:{
                type:String
            }
        }
    ]
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON=function(){
    const user=this
    
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}


userSchema.methods.getAuthToken=async function(){
    const user = this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.checkCredentials=async (email,password)=>{
    const user=await User.findOne({email:email})

    if(!user){
        return undefined
    }

    const authenticated = await bcrypt.compare(password,user.password)

    if(!authenticated){
        return undefined
    }

    return user
}

//Middleware Area
userSchema.pre('save',async function(next){
    const user=this

    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    
    next()
})

userSchema.pre('remove',async function(next){
    const user = this
    const tasks =await  Task.deleteMany({owner:user._id})
    next()
})

const User=mongoose.model('Users',userSchema)

module.exports=User