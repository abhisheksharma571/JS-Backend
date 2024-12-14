import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const channel = await User.findById(channelId)
    const userId = req.user._id;

    if(!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if(existingSubscription) {
        await existingSubscription.remove();
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"))
    } else {
        const newSubscription = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        return res.status(201).json(new ApiResponse(201, newSubscription, "Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const channel = await User.findById(channelId)
    if(!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.find({channel: channelId})
    .populate("subscriber", "name email")

    if(!subscribers.length){
        throw new ApiError(404, "No subsribers found for this channel");
    }

    return res.status(200).json(new ApiResponse(200, subscribers, "Subsribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(404, "Subscriber does not exist")
    }

    const subscriber = await User.findById(subscriberId)
    if(!subscriber){
        throw new ApiError(404, "Subscriber not found");
    }

    const subscribedChannels = await Subscription.find({subscriber: subscriberId})
    .populate("channel", "name email")

    if(!subscribedChannels.length){
        throw new ApiError(404, "No subscribed channel found for this user");
    }

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channel fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}