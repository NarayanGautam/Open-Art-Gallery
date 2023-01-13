import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const gallerySchema = new Schema({
    name: String,
    artist: String,
    year: Number,
    category: String,
    medium: String,
    description: String,
    image: String
});

export default mongoose.model("gallery", gallerySchema);
