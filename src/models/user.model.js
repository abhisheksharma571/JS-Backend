import mongoose, {Schema} from "mongoose";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,    //cloudinary url
            required: true
        },
        coverImage: {
            type: String,    //cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        console.log("Password not modified, skipping hash")
        return next()
    }
    
    try {
        console.log("Hashing new password")
        const hashedPassword = await bcrypt.hash(String(this.password).trim(), 10)
        console.log("Password hashed successfully")
        this.password = hashedPassword
        next()
    } catch (error) {
        console.error("Password hashing error:", error)
        next(error)
    }
})

userSchema.methods.isPasswordCorrect = async function(password) {
    try {
        console.log("Password validation started")
        
        if (!password) {
            console.log("Input password is missing")
            return false
        }

        // Ensure we're working with strings
        const inputPassword = String(password)
        
        // Simple comparison logging
        console.log({
            inputPasswordExists: !!inputPassword,
            storedPasswordExists: !!this.password,
            inputLength: inputPassword.length,
            storedLength: this.password?.length
        })

        // Do the comparison
        return await bcrypt.compare(inputPassword, this.password)
    } catch (error) {
        console.error("Password validation error:", error)
        return false
    }
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
        _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)