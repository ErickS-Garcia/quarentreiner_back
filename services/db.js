const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    //process.env.MONGO_URI
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;
