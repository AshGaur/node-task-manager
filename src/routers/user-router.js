const express = require('express')
const router = new express.Router
const User = require('../models/user')
const auth = require('../express-middleware/auth')
const sharp = require('sharp')
const multer = require('multer')
const {sendWelcomeEmail,sendCancellationEmail} = require('../emails/accounts')

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Only images with extensions jpg,jpeg and png are allowed'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({height:250,width:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.post('/users/logoutall',auth,async (req,res)=>{
    try{
        const user=req.user
        user.tokens.splice(0)
        await user.save()
        res.send({message:'All users logged out'})
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/logout',auth, async (req,res)=>{
    try{
        const user=req.user

        user.tokens=user.tokens.filter((token)=>token.token!==req.token)
        
        await user.save()

        res.send({message:'Logged out please login to continue !!!'})
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/login',async (req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['email','password']
    const isValidUpdate=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidUpdate || updates.length==0){
        return res.status(400).send({error:'Invalid Credentials please enter email and password correctly'})
        
    }

    try{
    //Check if already logged in    
    //-----------------------------------------------------------------------------------------------    
        // var flag=false
        // if(req.header('Authorization')){
        //     const present=req.header('Authorization').replace('Bearer ','')
        //     const presentdecoded=jwt.verify(present,'mysecretkey')
        //     const preuser=await User.findById(presentdecoded._id)
        //     if(preuser.email!==req.body.email){
        //         res.status(400).send({error:'Another user already logged in please logout first !!!'})
        //         flag=true
        //     }
        //     const val=preuser.tokens.filter((obj)=>obj.token===present)
            
        //     if(val.length>0 && !flag){
        //         res.send({user:preuser,token:present})
        //         flag=true
        //     }
        // }
        // if(flag){
        //     return
        // }
//--------------------------------------------------------------------------------------------------------
        const user=await User.checkCredentials(req.body.email,req.body.password)
        
        if(!user){
            res.status(400).send({error:'Bad Credentials'})
        }

        const token=await user.getAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users',async (req,res)=>{
    try{
        const user=new User(req.body)
        await user.save()
        sendWelcomeEmail(user.name,user.email)
        res.status(201).send(user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/users/me',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','email','password']
    const isValid=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValid){
        res.status(400).send({error:'Invalid updates !!!'})
    }

    try{
        const user=req.user
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()
        res.send(user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try{
        await req.user.remove()     //mongoose method
        sendCancellationEmail(req.user.name,req.user.email)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async (req,res)=>{
    const user = await User.findById(req.params.id)
    if(!user || !user.avatar){
        throw new Error('No user avatar for this id')
    }
    res.set('Content-Type','image/jpg')
    res.send(user.avatar)
})

router.get('/users/me',auth,async (req,res)=>{
    try{
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/users',async (req,res)=>{
    try{
        const users=await User.find({})
        res.send(users)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports=router