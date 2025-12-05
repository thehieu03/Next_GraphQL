import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";

const main = async () => {
    const dataSource = new DataSource({
        type: "postgres",
        host: process.env.DATABASE_HOST || "localhost",
        port: parseInt(process.env.DATABASE_PORT || "5432"),
        database: process.env.DATABASE_NAME!,
        username: process.env.DATABASE_USERNAME!,
        password: process.env.DATABASE_PASSWORD!,
        logging: process.env.NODE_ENV === "development",
        synchronize: true,
    });

    await dataSource.initialize();

    const app = express();

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log("Server started on port " + port);
    });
};

main().catch((err) => {
    console.log(err);
});