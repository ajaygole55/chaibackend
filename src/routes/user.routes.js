import { Router } from "express"
import { loginUser, registerUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.post('/register', registerUser)

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

//secure Routes
router.route("/logout").post(verifyJWT, loginUser)
// router.route("/login").post(registerUser)

export default router;