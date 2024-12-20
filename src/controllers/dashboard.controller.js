import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"

import Subscription from "../models/subscriber.model.js"

import {Like} from "../models/like.model.js"

import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params
    const user = await User.findById(channelId);

    if(!user){
        throw new ApiError(400,"channel Not found");
    }

    const totalVideos = await Video.countDocuments({owner : channelId})

    const totalViewsResult = await Video.aggregate([
        {
            $match: {owner:new mongoose.Types.ObjectId(channelId) }
        },
        {
            $group:{
                _id: null,
                viewsCount: { $sum: "$views"}
            }
        }
    ])

    let viewCount = 0;
    if (totalViewsResult.length > 0 && totalViewsResult[0].viewsCount !== undefined) {
        viewCount = totalViewsResult[0].viewsCount;
    }

    const totalLikesResult = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $group: {
                _id: null,
                totalLikes: {  $sum: { $size: { $ifNull: ["$likes", []] } } }
            }
        }
    ]);

    let totalLikes = 0;
    if (totalLikesResult.length > 0 && totalLikesResult[0].totalLikes !== undefined) {
        totalLikes = totalLikesResult[0].totalLikes;
    }

    return res.status(200).json(new ApiResponse(200, {
        totalVideos,
        viewCount,
        totalLikes
    }, "Channel stats fetched successfully"));
});
    



const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const user = await User.findById(channelId);
    if (!user) {
        throw new ApiError(404, "Channel not found");
    }

    console.log("channelId:", channelId);

    const videos = await Video.find({ owner: channelId });

    if (videos.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No videos uploaded by this channel"));
    }

    // Return the list of videos
    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

export {
    getChannelStats, 
    getChannelVideos
    }