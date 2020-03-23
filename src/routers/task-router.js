const express=require('express')
const router=new express.Router
const Task=require('../models/task-model')
const auth=require('../express-middleware/auth')

router.post('/tasks',auth,async(req,res)=>{
    try{
        const task = new Task({
            ...req.body,
            owner:req.user._id
        })
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

//GET /tasks
router.get('/tasks',auth,async (req,res)=>{
    const sort ={}
    const match = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        // const tasks = await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValid = updates.every((update)=>allowedUpdates.includes(update))
    if(!isValid){
        res.status(400).send({error:'Unknown request ,rolling back changes !'})
        return
    }
    try{
        const task =await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            res.status(404).send()
        }
        updates.forEach((update)=>task[update]=req.body[update])
        
        await task.save()

        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id',async (req,res)=>{
    try{
        const task =await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            res.status(404).send()
        }
        await task.remove()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports=router