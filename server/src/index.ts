import "dotenv/config";
import "reflect-metadata";
import express from "express";
import {DataSource} from "typeorm";
import {User} from "./entities/User.js";
import {Post} from "./entities/Post.js";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import {HelloResolver} from "./resolvers/hello.js";

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
        entities: [User, Post]
    });

    await dataSource.initialize();

    const app = express();

    // Build GraphQL schema
    const schema = await buildSchema({
        resolvers: [HelloResolver],
        validate: false,
    });

    // Create Apollo Server
    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }) => ({
            req,
            res,
            dataSource, // Make DataSource available in resolvers
        }),
    });

    await apolloServer.start();

    // Apply Apollo Server middleware to Express
    apolloServer.applyMiddleware({
        app: app as any,
        path: "/graphql",
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true,
        },
    });

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log("Server started on port " + port);
        console.log(`GraphQL endpoint: http://localhost:${port}${apolloServer.graphqlPath}`);
    });
};

main().catch((err) => {
    console.log(err);
});