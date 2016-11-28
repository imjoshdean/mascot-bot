import mongoose from 'mongoose';

const Schema = mongoose.Schema,
  Person = new Schema({
    firstName: String,
    lastName: String
  });

export default mongoose.model('person', Person);
