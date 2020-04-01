const request = require('supertest')
const app=require('../src/app')
const User = require('../src/models/user')
const {userOneId,userTwoId,userOne,userTwo,setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Signup a new User',async ()=>{
    const response = await request(app)
        .post('/users')
        .send({
            name:'Slade Wilson',
            email:'deathstroke@mirakuru.com',
            password:'sladewilson'
        })
        .expect(201)
    const user = await User.findById(response.body._id)
    expect(user.name).toBe('Slade Wilson')
    expect(user.email).toBe('deathstroke@mirakuru.com')
})

test('Get All Users',async ()=>{
    const response = await request(app)
        .get('/users')
        .send()
        .expect(200)
    
    expect(response.body.length).toBe(2)
})

test('Update userOne',async ()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
            email:'ashutosh@gmail.com'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.email).toBe('ashutosh@gmail.com')
})

test('Delete User userOne',async ()=>{
    await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should Login existing users', async ()=>{
    const response = await request(app)
        .post('/users/login')
        .send({
            email:userTwo.email,
            password:userTwo.password
        })
        .expect(200)
    const user = await User.findById(userTwoId)
    expect(user.tokens.length).toBe(2)
})

test('Should not login non existing users',  (done)=>{
    const response =  request(app)
        .post('/users/login')
        .send({
            email:'somerandom@email.com',
            password:'randomemail'
        })
        .expect(400)
        done()
})

test('Upload avatar',async ()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .attach('avatar','tests/fixtures/18980.jpg')
        .expect(200)
    const user = await User.findById(userTwoId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should not update invalid user fields',async ()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send({
            location:'gotham'
        })
        .expect(400)
})

test('Logout All user sessions for userTwo',async ()=>{
    await request(app)
        .post('/users/logoutAll')
        .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)
})