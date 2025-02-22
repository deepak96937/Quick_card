import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: {type: String, required:true},
    name: {type: String, required:true},
    email: {type: String, required:true, unique:true},
    imageUrl: {type: String, required:true},
    cartItems: {type:String, required:true},

}, {minimize:false})

const User = mongoose.models.user || mongoose.model('user', userSchema);


export default User;



// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     _id: { type: String, required: true }, 
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     imageUrl: { type: String, required: true },
//     cartItems: { type: String, required: true }, 
// }, { minimize: false });

// const User = mongoose.models.User || mongoose.model("User", userSchema);

// export default User;
