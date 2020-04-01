const express=require('express')
const app=express()
const userRouter=require('./routers/user-router')
const taskRouter=require('./routers/task-router')

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

module.exports=app