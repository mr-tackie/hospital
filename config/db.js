const mongoose = require('mongoose');
const config = require('config');

//get mongodb connection uri string
const db = config.get("mongoURI");

//connect to mongodb cluster using mongoose
const connectDB = async () => {
    try{
        await mongoose.connect(db, {
            useNewUrlParser: true, //fix URI parse deprecation error
            useUnifiedTopology: true, //fixes server discovery deprecation warning
            useCreateIndex: true, //fix ensureIndex deprecation warning
        });
        console.log('MongoDB connected successfully');
    } catch(error){
        console.error(error.message);

        //Exit process with failure
        process.exit(1);
    }
}


module.exports = connectDB;
