import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import wordsRoutes from "./routes/wordsRoutes.js";
import cors from "cors";
import { server, app } from "./socketHandler/UsersConnection.js";

dotenv.config();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
    res.send(`Hi From Server`);
})

app.use("/api/words", wordsRoutes);

server.listen(PORT, (req, res) => {
    console.log(`Server is Running At http://localhost:${PORT}`.green.bold);
})