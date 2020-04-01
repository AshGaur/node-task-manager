const request = require('supertest')
const app =require('../src/app')
const Task = require('../src/models/task-model')
const {userOneId,userTwoId,userOne,userTwo,taskOne,taskTwo,taskThree,setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Create Task',async ()=>{
    await request(app)
        .post('/tasks')
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send({
            description:'Request Suit Updates from Mr. Fox',
            completed: true
        })
        .expect(201)
})

test('Read All tasks',async ()=>{
    const response = await request(app)
        .get('/tasks')
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2)
})

test('Update a task',async ()=>{
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
            description:'Finish Testing',
            completed:true
        })
        .expect(200)
    const task = await Task.findById(taskOne._id)
    expect(task.description).toBe('Finish Testing')
})

test('Delete Task', async ()=>{
    const response =  await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)
    const task = await Task.findById(taskThree._id) 
    expect(task).toBeNull()
})

test('Update without auth',async ()=>{
    await request(app)
        .patch(`/tasks/${taskTwo._id}`)
        .send({
            description:'Jason Todd\'s rebirth'
        })
        .expect(401)
})

test('Delete without auth',()=>{
    request(app)
        .delete(`/tasks/${taskTwo._id}`)
        .send()
        .expect(401)
})

test('Delete other user\'s task',async ()=>{
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
})