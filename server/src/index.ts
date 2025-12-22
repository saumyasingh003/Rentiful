import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/auth.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS Configuration for AWS API Gateway
const corsOptions = {
  origin: [
    "https://main.d2nxz9yv1ltxzs.amplifyapp.com",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600,
};

app.use(cors(corsOptions));

// Ensure CORS headers on all responses (important for AWS API Gateway)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && corsOptions.origin.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
});

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/applications", applicationRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
