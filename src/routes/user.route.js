import router from "express";
import { loginUserController, logoutUserController, registerUserController } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";

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

export default userRouter;