import express from "express";
import { wordLengthHandle } from "../controllers/wordControllers.js";

const Routes = express.Router();

Routes.post("/", wordLengthHandle);

export default Routes;