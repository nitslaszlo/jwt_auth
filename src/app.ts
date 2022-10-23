import * as favicon from "serve-favicon";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as mongoose from "mongoose";
import * as cors from "cors";
import loggerMiddleware from "./middleware/logger.middleware";
import { createClient } from 'redis';
import express, { NextFunction, Request, Response } from 'express';

export default class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.connectToTheDatabase();
        this.connectToRedis();
        this.initializeMiddlewares();
        this.initializeControllers();

    }

    public listen(): void {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }

    public getServer(): express.Application {
        return this.app;
    }

    private initializeMiddlewares() {
        try {
            this.app.use(favicon(path.join(__dirname, "../favicon.ico")));
        } catch (error) {
            console.log(error.message);
        }
        this.app.use(express.json());
        this.app.use(cookieParser());
        // Enabled CORS:
        this.app.use(
            cors({
                origin: ["https://jedlik-vite-quasar-template.netlify.app", "https://jedlik-vite-ts-template.netlify.app", "http://localhost:8080", "http://127.0.0.1:8080"],
                allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Content-Language", "Expires", "Last-Modified", "Pragma"],
                credentials: true,
                exposedHeaders: ["Set-Cookie"],
            }),
        );
        this.app.use(loggerMiddleware);


    }

    private initializeControllers() {
        this.app.get('/healthChecker', (req: Request, res: Response, next: NextFunction) => {
            res.status(200).json({
                status: 'success',
                message: 'Welcome to CodevoWeb????',
            });
        });
    }



    private connectToTheDatabase() {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH, MONGO_DB } = process.env;
        // Connect to MongoDB Atlas, create database if not exist::
        mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}${MONGO_DB}?retryWrites=true&w=majority`, err => {
            if (err) {
                console.log("Unable to connect to the server. Please start MongoDB.");
            }
        });

        mongoose.connection.on("error", error => {
            console.log(`Mongoose error message: ${error.message}`);
        });
        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB server.");
        });
    }

    private async connectToRedis() {
        const redisUrl = `redis://jwt-auth.cyclic.app:6379`;
        const redisClient = createClient({
            url: redisUrl,
        });
        try {
            await redisClient.connect();
            console.log('Redis client connected...');
        } catch (err: any) {
            console.log(err.message);
            setTimeout(this.connectToRedis, 5000);
        }
        redisClient.on('error', (err) => console.log(err));
    }
}

