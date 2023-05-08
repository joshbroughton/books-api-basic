# Book Endpoints

All of the endpoints here (except /search) require a valid JWT token. See User endpoints for information on signing up and logging in.

## Get all books for this user
### <span style="color:green">GET</span> /books/

## Search for books
### <span style="color:green">GET</span> /books/search

Use this endpoint to search the google books API. It returns the first ten results, filtered to only include the attributes necessary for adding a book to your library with this API.

### Example Request

`/books/search/?query=the+house+of+god`

### Example Response Body

```
{
    "books": [
        {
            "title": "The House of God",
            "author": "Samuel Shem",
            "genre": "Fiction",
            "publisher": "Berkley Publishing Group",
            "pages": 380
        },
        {
            "title": "Man's 4th Best Hospital",
            "author": "Samuel Shem",
            "genre": "Fiction",
            "publisher": "Penguin",
            "pages": 384
        },
        ...
    ]
}
```
## Get info for an existing book
### <span style="color:green">GET</span> /books/:bookId

### Example Request
`http://localhost:3000/books/64595c46c07b70843ab37ba1`
### Example Response Body
```
{
    "book": {
        "_id": "64595c46c07b70843ab37ba1",
        "title": "The House of God",
        "author": "Samuel Shem",
        "genre": "Fiction",
        "pages": 380,
        "__v": 0
    }
}
```
## Create new Book
### <span style="color:yellow">POST</span> /books/
Add a new book to your library.

### Example Request
```
{
    "title": "The House of God",
    "author": "Samuel Shem",
    "genre": "Fiction",
    "publisher": "Berkley Publishing Group",
    "pages": 380
}
```

### Example Response Body
```
{
    "book": {
        "_id": "64595c46c07b70843ab37ba1",
        "title": "The House of God",
        "author": "Samuel Shem",
        "genre": "Fiction",
        "pages": 380,
        "__v": 0
    }
}
```

## Update a book
### <span style="color:darkblue">PUT</span> /books/:bookId
Update one book by book ID (the mongoDB objectID).

### Example Request
```
{
	"title": "Updated"
}
```

### Example Response Body
```
{
    "book": {
        "_id": "64595c46c07b70843ab37ba1",
        "title": "Updated",
        "author": "Samuel Shem",
        "genre": "Fiction",
        "pages": 380,
        "__v": 0
    }
}
```
## Delete a book
### <span style="color:red">DELETE</span> /books/:bookId
Remove a book from your library by bookId.

### Example Request
The request body is empty.

### Example Response Body
```
{
    "message": "Successfully deleted."
}
```
