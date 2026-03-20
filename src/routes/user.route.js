import router from "express";
import { registerUserController } from "../controllers/user.controller.js";

const userRouter = router();

userRouter.route("/register").post(registerUserController);

export default userRouter;