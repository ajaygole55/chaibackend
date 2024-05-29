import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = User.findById(userId)
    const accessToekn = user.generateAccsesToken();
    const refreshToken = User.generateRefreshToken();

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false });

    return { accessToekn, refreshToken }

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
  if (!username || !email) {
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

  const { accessToekn, refreshToken } = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .cookie("accessToekn", accessToekn, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "User Is logegd in"
    })

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
    .json({message :"User Logged Out"})

});
export {
  registerUser,
  loginUser,
  logoutUser

};
