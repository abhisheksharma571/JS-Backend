import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Comment } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user._id

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({
        video: videoId, 
        likedBy: userId
    })

    if(existingLike){
        await existingLike.remove()
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"))
    }

    const like = await Like.create({
        video: videoId,
        likedBy: userId
    })

    return res.status(201).json(new ApiResponse(201, like, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    const existingLike = await Like.findOne({
        comment: commentId, 
        likedBy: userId
    })

    if(existingLike){
        await existingLike.remove()
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"))
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    return res.status(201).json(new ApiResponse(201, like, "Comment liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId, 
        likedBy: userId
    })

    if(existingLike){
        await existingLike.remove()
        return res.status(200).json(new ApiResponse(200, null, "Tweet unliked successfully"))
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    return res.status(201).json(new ApiResponse(201, like, "Tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true }
    }).populate("video")

    if(!likedVideos.length){
        throw new ApiError(404, "No liked videos found")
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}