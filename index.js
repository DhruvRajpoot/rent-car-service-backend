import express from 'express';
import connectdatabase from './Database/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Auth from './Routes/Auth.js';

const app = express();
const port = process.env.PORT || 8080;

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
connectdatabase();

// Routes
app.use('/auth', Auth);

app.listen(port, () => {
    console.log(`listening at port ${port}`);
});