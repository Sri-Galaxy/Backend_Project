import router from "express";
import { loginUserController,
    logoutUserController,
    registerUserController,
    refreshAccessTokenController,
    getCurrentUserController,
    changePasswordController,
    updateAccountController,
    updateAvatarController,
    updateCoverImageController,
    getAccountProfileController,
    deleteAccountController
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const userRouter = router();

userRouter.route("/register").post(
    upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
    ]), 
    registerUserController
);

userRouter.route("/login").post(loginUserController);

userRouter.route("/logout").post(verifyJWT, logoutUserController);

userRouter.route("/refreshToken").post(refreshAccessTokenController);

userRouter.route("/changePassword").post(verifyJWT, changePasswordController);

userRouter.route("/user").get(verifyJWT, getCurrentUserController);

userRouter.route("/updateProfile").patch(verifyJWT, updateAccountController);

userRouter.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatarController);

userRouter.route("/coverImage").patch(verifyJWT, upload.single("coverImage"), updateCoverImageController);

userRouter.route("/channel/:username").get(verifyJWT, getAccountProfileController);

userRouter.route("/delete").delete(verifyJWT, deleteAccountController);

export default userRouter;