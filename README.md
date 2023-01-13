# Open Art Gallery 
This is a full stack web application developed for the Intro to Web Development course at Carleton University. 
## Steps to test and run program:
Run the command `npm install` to install all project dependencies

Run the command `node database-initializer.js` to initialize database

This creates a new MongoDB database called `gallery` which uses images from gallery.json as well as some images taken from https://artvee.com/ which provides public access to classic art and “https://picsum.photos/” random image API 

Run the command `node server.js` to start the server and listen on port 3000, as well as establish connection with the database

Open “http://localhost:3000/” on a browser of your choice to test out the server.


