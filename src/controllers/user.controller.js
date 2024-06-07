import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefereshTokens = async (userId) => {
  try {

    const user = await User.findById(userId)

    const accessToken = String(await user.generateAccsesToken())
    const refreshToken = String(await user.generateRefreshToken())
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "something went Wrrong while genrerating referesh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation -not empty
  //check if user already exists username and email
  //check for images
  // check for avtar
  //upload them to cloudinary
  //create user object-craete entry in db
  //remove password and refrestoken filed from response
  //check for user creation
  //return response

  const { fullName, email, username, password } = req.body;

  console.log("Second data", fullName, email, username, password);
  // if (
  //   [fullName, email, username, password].some((field) => field?.trime() === "")

  // ) {
  //   throw new ApiError(400, "All filed are Required");
  // }
  const fields = [fullName, email, username, password];
  fields.some(field => {
    if (field?.trim) {
      // Corrected from trime to trim
      field = field.trim();
    }
    if (field === "") {

      throw new ApiError(400, "All fields are Required");
    }
  });

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or Username already exists");
  }

  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log("AJay gole",avatarLocalPath,coverImageLocalPath)

  if (!avatarLocalPath) {

    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    // coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });
  const createdUser = User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something Went Wrrong when register the user");
  }

  return res
    .status(201)
    .json({ message: "User register successfully " });

});
const loginUser = asyncHandler(async (req, res) => {
  // req body=>
  //username or email
  //find the username 
  //find the user
  //password check
  //acces and refrese token
  //send cookies
  const { email, username, password } = req.body
  if (!(username || email)) {
    throw new ApiError(400, "username or password is required")

  }
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not  exist")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user   credentials")

  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

  console.log("TOKEN", accessToken, refreshToken)
  const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
      )
    )


  // .json({

  //   statusCode: 200,
  //   data: {
  //     user: loggedInUser, accessToken, refreshToken
  //   },
  //   message: "User logged In Successfully",

  // })


})

const logoutUser = asyncHandler(async (req, res) => {
  //clear cookies
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .clearCookie("accessToekn", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User Logged Out" })

});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken ||
    req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  const decodeToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  const user = await User.findById(decodeToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid  Refresh Token");
  }
  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Invalid  Refresh Token");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

  const options = {
    httpOnly: true,
    secure: true
  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user:  accessToken, refreshToken
        },
        "User logged In Successfully"
      )
    )


  
})
export {
  registerUser,
  loginUser,
  logoutUser

};
