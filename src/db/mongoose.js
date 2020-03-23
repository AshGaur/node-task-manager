const mongoose=require('mongoose')

mongoose.connect(process.env.DB_PATH,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:true
}).then(()=>{
    console.log('Database Connected !!!')
}).catch((e)=>{
    console.log('Error Connecting to the database:',e)
})
