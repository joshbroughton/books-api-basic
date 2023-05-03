const express = require('express')
const router = express.Router();

const User = require('../models/user')

router.get('/', (req, res) => {
    User.find().then((users) => {
        return res.json({users})
    })
    .catch((err) => {
        throw err.message
    });
})

router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId });
        return res.json({ user })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

router.post('/', (req, res) => {
    let user = new User(req.body)
    user.save().then(userResult => {
        return res.json({user: userResult})
    }).catch((err) => {
        throw err.message
    })
})

router.put('/:userId', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, req.body);
        const user = await User.findOne({ _id: req.params.userId });
        return res.json({ user })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

router.delete('/:userId', (req, res) => {
    User.findByIdAndDelete(req.params.userId).then(() => {
        return res.json({
            'message': 'Successfully deleted.',
            '_id': req.params.userId
        })
    })
    .catch((err) => {
        throw err.message
    })
})

module.exports = router

