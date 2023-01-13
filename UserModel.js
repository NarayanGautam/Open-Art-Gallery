import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const model = mongoose.model;

// create a schema for the user
const userSchema = new Schema({
    username: String,
    password: String,
    accountType: String,
});

// export the model for the user schema
export default model("users", userSchema);