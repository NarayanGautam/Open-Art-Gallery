// import mongoose and schemas of gallery and user
import mongoose from 'mongoose';
import Gallery from './GalleryModel.js';
import User from './UserModel.js';

// import gallery json file
import gallery from './gallery.json' assert { type: 'json' };
// used https://artvee.com/ for public classic images and https://picsum.photos/600 to get random public images
// some images also from #artwork-library channel on discord

// set up some default users 
const users = [
	{'username': 'davinci', 'password':'1', 'accountType':'artist'},
    {'username': 'picasso', 'password':'1', 'accountType':'artist'},
	{'username': 'patron', 'password':'1', 'accountType':'patron'},
	{'username': 'artist', 'password':'1', 'accountType':'artist'}
];


// async function to connect and load data into database
const loadData = async () => {
	// connect to mongodb, using localhoset (127.0.0.1)
	await mongoose.connect('mongodb://127.0.0.1:27017/artgallery', { useNewUrlParser: true, useUnifiedTopology: true });
	// drop existing database
	await mongoose.connection.dropDatabase();
	
	// create new gallery and user objects, and then create them in the database
	let galleries = gallery.map( aGallery => new Gallery(aGallery));
	let user = users.map( aUser => new User(aUser));
	
	await Gallery.create(galleries);
	await User.create(user);
	
};

// call loadData function, and then close connection
loadData()
.then((result) => {
	console.log("Closing database connection.");
	mongoose.connection.close();
})
.catch((err) => console.log(err));












