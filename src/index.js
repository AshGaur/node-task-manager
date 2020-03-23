const express=require('express')
const app=express()
const userRouter=require('./routers/user-router')
const taskRouter=require('./routers/task-router')
const port=process.env.PORT

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Server is up and running on port:',port)
})