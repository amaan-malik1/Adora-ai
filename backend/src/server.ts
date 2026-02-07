import express from "express"
import cors from "cors"
import dotenv from "dotenv"

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3001;

//middleware
app.use(cors());

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})