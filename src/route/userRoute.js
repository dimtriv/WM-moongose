const express = require('express')
const router = new express.Router()

//IMPORT MODELS
//pengganti db.collection
const User= require('../models/userModel')

//UPLOAD MULTER
const multer = require('multer')
const upload = multer({
    limits : {
        fileSize : 1000000//byte
    },
    fileFilter(req, file, cb) {
        //file = {fieldname: avatar, originalname: 'maxresdefault.jpg'}
        //$ penanda bahwa kata terakhir
        // \. apapun yang ada didepannya(bebas)
        if(file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File harus berupa jpg, jpeg, png'))
        }
        cb(null, true)
    }
})

//UPLOAD FOTO
//upload.single('avatar') harus sama dengan d body form data, kemungkinan juga sama dengan react 
router.post('/users/avatar/:userid', upload.single('avatar'), async (req, res) => {
    try {
        //req.file = {fieldname, originalname, buffer}
        let user = await User.findById(req.params.userid)
        user.avatar = req.file.buffer
        // res.send(req.file.originalname)
        await user.save()
        res.send('Upload success')
    } catch (err) {
        res.send(err)
    }
})

//es7
//Async await
//try catch
//Read all user
router.get('/users', async (req, res)=>{
    
    try {
        let users = await User.find({})
        res.send(users)
    } catch (err) {
        res.send(err)
    }
    
    //es6
    // User.find({})
    // .then(resp => res.send(resp))
    // .catch(err => res.send(err))
})

//Read One User By Id
//{error : "User dengan id 989999 tidak ditemukan"}
router.get('/findbyid', async (req, res)=>{
    try {
        //let id bisa diletakkan diluar try agar bisa diakses di catch juga
        //bisa juga pakai params
        //pembeda antara query dan params hanya dibanyaknya data, kalau mau mengirim banyak data sebaiknya pakai query saja , karena kalau params urlnya kebanyakan /:.../:../:..,  akan tetapi keduanya akan tetap bekerja
        let id = req.query.id
        let user = await User.findById(id)
        //jika user tidak
        if(!user){
            return res.send({error: `User dengan id: ${id} tidak ditemukan`})
        }
        res.send(user)
    } catch (err) {
        res.send(err)
    }
})

// LOGIN USER
//menggunakan post walaupun sedang meng'GET' data agar data yang diambil tidak muncul di link (karena data pada saat login sensitif)
//kalau ditembak langsung data bisa muncul
router.post('/user/login', async (req, res) => {
    // req.body = {email : ... , password: ...}
    let {email, password} = req.body

    try {
        let user = await User.loginByEmailPassword(email, password)
        //jika berhasil maka akan berisi data user
        res.send(user)
    } catch (err) {
        // jika gagal akan berisi pesan err
        res.send({err_message : err.message})
    }

})

//Update User By Id
router.patch('/user/:_id', (req, res)=>{
    let _id = req.params._id
    let body = req.body

    //dengan menggunakan callback yang merupakan es5
    User.findByIdAndUpdate(_id, body, function(err, resp){
        if(err){
            return res.send(err)
        }
        res.send(resp)
    })
        
})


//Delete User By Id
router.delete('/user/:_id', async (req,res)=>{
    let _id = req.params._id
    try {
        let user = await User.findByIdAndDelete({_id})
        if(!user){
            return res.send({error: `User dengan id: ${_id} tidak ditemukan di database`})
        }
        res.send({
            message: `User berhasil dihapus`,
            user
        })
    } catch (error) {
        res.send(error)
    }
})

//Create new user, REGISTER
router.post('/users', async (req,res)=>{
    //req.body ={username: 'dimas', name: 'Dimas', age: 29}

    //CREATE NEW USER
    const user = new User(req.body)

    try {
        let resp = await user.save()
        res.send(resp)
    } catch (error) {
        res.send(error)
    }

    //ES6
    //SAVE ke database
    // user.save().then(resp => res.send(resp)).catch(err => res.send(err))
})

module.exports = router