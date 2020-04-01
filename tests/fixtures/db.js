const User = require('../../src/models/user')
const Task = require('../../src/models/task-model')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id:userOneId,
    name:'Ashutosh Gaur',
    email:'techgeniusashutosh@gmail.com',
    password:'ashutosh',
    tokens:[{
        token:jwt.sign({_id:userOneId},process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id:userTwoId,
    name:'Bruce Wayne',
    email:'brucewayne@thedarkknight.com',
    password:'iamthebatman',
    tokens:[{
        token:jwt.sign({_id:userTwoId},process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description:'Complete Node.js Course',
    owner:userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Solve the mystery and find who is Red Hood',
    completed:true,
    owner:userTwoId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description:'Investigate the crime scene at the Gotham Royale Hotel',
    completed:true,
    owner:userTwoId
}

const setupDatabase = async ()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports={
    userOneId,
    userTwoId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}