import express from "express";

const port = process.env.PORT || 4035

const app = express();

app.listen(port, () => {
    console.log("Server running on port:",port);
})