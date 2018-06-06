# Webchat

## Getting started

### Install MongoDB
Make sure you have a [MongoDB](https://www.mongodb.com) instance up and running. I suggest you try the [official Docker repository for MongoDB](https://hub.docker.com/_/mongo/) to have it setup *very* quickly. 

### Start the web server
You can easily start the server by using `npm`:

    $ npm install
    $ npm start

It will install all the dependencies required for this project and start the server right after.

    > chat@1.0.0 start /SharedFolders/Data/SharedDocuments/Dev/webchat
    > node server.js

    Thu May 11 2017 21:46:38 GMT+0100 (BST)> Server running on *:3000
    Thu May 11 2017 21:46:38 GMT+0100 (BST)> -- Connected to mongodb://localhost:27017/webchat

Now everything is set up, you can browse to `http://localhost:3000/` and enjoy this lightweight and efficient web chat!

## Technologies

- [NodeJS](http://nodejs.org/)
- [MongoDB](https://www.mongodb.com)
- [Socket.IO](https://socket.io/)