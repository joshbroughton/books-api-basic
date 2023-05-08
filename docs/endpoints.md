# Users and Authentication

## Create a User
### <span style="color:yellow">POST</span> /users/sign-up

### Example Request Body
`{ "username": "josh","password": "password" }`

### Example Response Body
`{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDU0MDAyNjc3OGQ3OTRkNjQxOGQxYjAiLCJpYXQiOjE2ODMyMjY2NjMsImV4cCI6MTY4MzIzMDI2M30.iqSxRnRmLHOmd62ZsVQigE7zJTK82iJVi8KsyU3-3Gg"
}`

**Important: The token returned here is the one that needs to be included on all other requests to the API.**

## Login an existing User
### <span style="color:yellow">POST</span> /users/login

### Example Request Body
`{ "username": "josh","password": "password" }`

### Example Response Body
```
{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDU0MDAyNjc3OGQ3OTRkNjQxOGQxYjAiLCJpYXQiOjE2ODMyMjY2NjMsImV4cCI6MTY4MzIzMDI2M30.iqSxRnRmLHOmd62ZsVQigE7zJTK82iJVi8KsyU3-3Gg"
}
```

**Important: The token returned here is the one that needs to be included on all other requests to the API.**

## Show an existing user
### <span style="color:green">GET</span> /users/show

This request just needs to include a valid JWT, and will return information for the User associated with the supplied JWT.

### Example Response Body

```
{
    "user": {
        "books": [
            "64595c46c07b70843ab37ba1"
        ],
        "_id": "64540026778d794d6418d1b0",
        "username": "josh",
        "__v": 3
    }
}
```

## Update an existing User
### <span style="color:darkblue">PUT</span> /users/update

### Example Request Body

`{ "username": "josh", "password": "newPassword" }`

Both parameters are optional. The User will be updated with whatever arguments are included in the request. A valid JWT must be sent with the request, and the update will impact the user that the valid JWT is associated with.

### Example Response Body

`{ "message": "Updated successfully!" }`

## Delete an existing User
### <span style="color:red">DELETE</span> /users/delete

This will delete the current User, and the library will be lost.

### Example Response Body

`{  "message": "User successfully deleted." }`
