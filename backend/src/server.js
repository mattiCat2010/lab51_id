import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConnect } from "./config/db.js";
import { authCheck } from "./middleware/auth.js";
import instrumentRoutes from "./routes/instrumentRoutes.js";
import humanRoutes/*, { debug }*/ from "./routes/humanRoutes.js";
import materialsRoutes from "./routes/materialsRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import storageRoutes from "./routes/storageRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const port = process.env.PORT || 4035
const app = express();

app.use(express.json())

// DEBUG MIDDLEWARE
// app.use((req, res, next) => {
//     // console.log(req.headers)
//     // console.log(req.body)
//     // debug()
//     console.log(req.originalUrl === "/api/login/")
//     next()
// })

app.use((req, res, next) => authCheck(req, res, next))

// Routes
app.use("/api/instruments", instrumentRoutes)

app.use("/api/humans", humanRoutes)

app.use("/api/materials", materialsRoutes)

app.use("/api/projects", projectRoutes)

app.use("/api/storage", storageRoutes)

// app.use(
//     "/api/login",
//     (req, res, next) => login(req, res, next)
// )

app.use("/api/login", authRoutes)

// Serve the API tester static UI (same origin to avoid CORS issues)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/api-tester', express.static(path.join(__dirname, '../api-tester')));

dbConnect().then(
    app.listen(port, () => {
        console.log("Server running on port:", port);
    })
)