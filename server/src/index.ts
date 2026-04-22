import express from "express";
import type { Application, Request, Response } from "express";
import expenseRouter from "./routes/expenseRoutes.js";
import authRouter from "./routes/authRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: "*", // to be changed for frontend host later
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("OK");
});

app.use("/api/expenses", expenseRouter);
app.use("/api/users", authRouter);
app.use("/api/analytics", analyticsRouter);

app.use("*splat", (req, res) => {
  res.status(404).json({
    success: false,
    error: `cannot find ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

app.listen({ port: PORT }, () => {
  console.log(`server is running at :${PORT}`);
  console.log(`environment: ${process.env.NODE_ENV || "development"}`);
});
