import express from "express";
import { dbConnect } from "./config/db.js";
import instrumentRoutes from "./routes/instrumentRoutes.js";
import humanRoutes from "./routes/humanRoutes.js";
import materialsRoutes from "./routes/materialsRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import storageRoutes from "./routes/storageRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const port = process.env.PORT || 4035
const app = express();

app.use(express.json())

app.use("/api/instruments", instrumentRoutes)

app.use("/api/humans", humanRoutes)

app.use("/api/materials", materialsRoutes)

app.use("/api/projects", projectRoutes)

app.use("/api/storage", storageRoutes)

app.use("/api/auth", authRoutes)

dbConnect().then(
    app.listen(port, () => {
        console.log("Server running on port:",port);
    })
)