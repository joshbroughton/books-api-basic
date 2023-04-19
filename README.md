# Create a Messages API ([lesson plan](https://github.com/Tech-at-DU/ACS-2230-Server-Side-Architectures/blob/master/Lessons/04-Databases/README.md#create-a-messages-api-30-minutes))

Clone the [starter code](https://github.com/tech-at-du/messages-api-starter) to get started with this activity. Open the directory in your terminal and run `npm install`. The starter code already includes code to set up the Mongoose connection; all we need to do is add the models and modify the routes.

To start off, visit your endpoints in Postman to see how you can interact with them. There are CRUD endpoints for the `User` resource and the `Message` resource - however, those resources haven't actually been written yet!

### User Model

Add the following code to `src/models/user.js`. For now, we'll be storing our passwords in plaintext, which is not very secure! We'll fix that in a future lesson.

```js
const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, select: false }
})

const User = mongoose.model('User', UserSchema)

module.exports = User
```

Then modify the routes in `src/routes/user.js` as follows:

```js
const User = require('../models/user')

router.get('/', (req, res) => {
    User.find().then((users) => {
        return res.json({users})
    })
    .catch((err) => {
        throw err.message
    });
})

router.get('/:userId', (req, res) => {
    console.log(`User id: ${req.params.userId}`)
    User.findById(req.params.userId).then((user) => {
        return res.json({user})
    })
    .catch((err) => {
        throw err.message
    });
})

router.post('/', (req, res) => {
    let user = new User(req.body)
    user.save().then(userResult => {
        return res.json({user: userResult})
    }).catch((err) => {
        throw err.message
    })
})

router.put('/:userId', (req, res) => {
    User.findByIdAndUpdate(req.params.userId, req.body).then((user) => {
        return res.json({user})
    }).catch((err) => {
        throw err.message
    })
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
```

### Activity: Message Model

Using the existing code as a reference, write the `Message` model and modify the routes to execute the CRUD operations on `Message` objects. A `Message` should have the required fields of `title`, `body`, and `author`.

### Connecting our Models

We want to specify that there is a one-to-many relationship between `Message` and `User` (that is, a user can have many messages, but a message can have only one author).

In `models/message.js`, add the following to the model definition:

```js
const MessageSchema = new Schema({
  // ...
  author : { type: Schema.Types.ObjectId, ref: "User", required: true },
})
```

Then in `models/user.js`, add the following:

```js
const UserSchema = new Schema({
  messages : [{ type: Schema.Types.ObjectId, ref: "Message" }]
})
```

Then, in `routes/message.js`, let's make sure that the `User` model is updated whenever we add a new message:

```js
/** Route to add a new message. */
router.post('/', (req, res) => {
    let message = new Message(req.body)
    message.save()
    .then(message => {
        return User.findById(message.author)
    })
    .then(user => {
        console.log(user)
        user.messages.unshift(message)
        return user.save()
    })
    .then(_ => {
        return res.send(message)
    }).catch(err => {
        throw err.message
    })
})
```

Let's try it out in Postman!

Finally, let's make sure that whenever we make a query for users, we see that user's messages as well. Add the following to `models/user.js`:

```js
UserSchema.pre('findOne', function (next) {
    this.populate('messages')
    next()
})

UserSchema.pre('find', function (next) {
    this.populate('messages')
    next()
})
```
