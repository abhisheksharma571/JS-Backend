import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    let filter = {}

    if(query){
        filter = {
            $or: [
                {title: {$regex: query, $options: "i"}},
                {description: {$regex: query, $options: "i"}}
            ]
        }
    }
    // if the userId is provided, filter by userId
    if(userId){
        filter.owner = userId
    }

    const videos = await Video.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))

    const totalVideos = await Video.countDocuments(filter)

    return res.status(200).json({
        success: true,
        data: {
            videos,
            currentPage: Number(page),
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit)
        }
    })
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // Ensure all required fields are provided
    if (!(title && description && req.files)) {
        throw new ApiError(400, "Title, description, video file, and thumbnail are required");
    }

    // Ensure the video file exists
    if (!req.files.videoFile || req.files.videoFile.length === 0) {
        throw new ApiError(400, "Video file is required");
    }

    // Ensure the thumbnail exists
    if (!req.files.thumbNail || req.files.thumbNail.length === 0) {
        throw new ApiError(400, "Thumbnail is required");
    }

    // Handle the video file upload
    const videoFilePath = req.files.videoFile[0].path;
    const uploadResponse = await uploadOnCloudinary(videoFilePath);
    if (!uploadResponse) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
    }

    // Handle the thumbnail upload
    const thumbNailFilePath = req.files.thumbNail[0].path;
    const thumbNailUploadResponse = await uploadOnCloudinary(thumbNailFilePath);
    if (!thumbNailUploadResponse) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }

    // Create the new video entry
    const newVideo = await Video.create({
        videoFile: uploadResponse.url, // Cloudinary URL for video
        thumbNail: thumbNailUploadResponse.url, // Cloudinary URL for thumbnail
        title,
        description,
        duration: req.body.duration || 0, // Assuming duration can be provided in the body
        owner: req.user.id, // Assuming user is authenticated and ID is in req.user
    });

    return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID")
    }

    const video = await Video.findById(videoId).populate('owner', 'name')

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, video, "Video found successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const { title, description, thumbnail } = req.body

    if(title){
        video.title = title
    }

    if(description){
        video.description = description
    }

    if(thumbnail){
        video.thumbnail = thumbnail
    }

    await video.save()

    return res.status(200).json(new ApiResponse(200, video, "Video details updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle publish status
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(new ApiResponse(200, video, "Video status updated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}