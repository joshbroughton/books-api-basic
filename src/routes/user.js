const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const authenticate = require('../middleware/authenticate');

const User = require('../models/user')

// this would be an admin function, but different levels of authorization
// have not been added at this time
// router.get('/', (req, res) => {
//     User.find().then((users) => {
//         return res.json({users})
//     })
//     .catch((err) => {
//         throw err.message
//     });
// })

// return information about current user, ie the user passed
// in the JWT
router.get('/show', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId);
        return res.json({ user })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

// sign up route
router.post('/sign-up', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

// login route
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username }, 'username password');
      if (!user) {
        // User not found
        return res.status(401).send({ message: 'Wrong Username or Password' });
      }
      // Check the password
      user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          // Password does not match
          return res.status(401).send({ message: 'Wrong Username or password' });
        }
        // Create a token
        const token = jwt.sign({ userId: user._id,  }, process.env.SECRET_KEY, {
            expiresIn: '1h'
        });
        return res.json({ token });
      });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
  });

  // update the current user (user passed in the JWT)
router.put('/update', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId);
        if (req.body.username) {
            user.username = req.body.username;
        }
        if (req.body.password) {
            user.password = req.body.password;
        }
        await user.save();
        return res.json({ message: "Updated successfully!" })
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
})

// delete the current user (user passed in JWT)
router.delete('/delete', authenticate, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.auth.userId);
        return res.json({
            'message': 'User successfully deleted.',
            '_id': req.params.userId
        });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router

