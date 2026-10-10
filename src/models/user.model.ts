import { models, model , Schema} from "mongoose"



const userSchema = new Schema({
    user: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        age: {
            type: Number,
            required: true
        }
    }
},{ timestamps: true });