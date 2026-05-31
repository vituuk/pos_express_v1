const express = require("express");
const app = express();
const port = 3000;
const db = require("./models");
const categoryRoutes = require("./src/routes/category");
const productRoutes = require("./src/routes/product");
const orderRoutes = require("./src/routes/order");
const authRoutes = require("./src/routes/auth");
const testOrderRotes = require("./src/routes/test-order");
const middleWareRoutes = require("./src/middlewares/middlewares");
const productImageRoutes = require("./src/routes/productImage");
const fileUpload = require("express-fileupload");
const path = require("path");
const paginationRoutes = require("./src/routes/pagination");
const orderReportRoutes = require("./src/routes/orders-report");
const testingRoutes = require("./src/routes/testing");
const cors = require("cors");
const paymentRoute = require("./src/routes/payment");

const {storage} = require("./src/storage/storage");
const multer = require("multer");
const upload = multer({ storage: storage });

require("dotenv").config();

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected...");
  })
  .catch((error) => {
    console.log("Error:" + error);
  });

app.use(express.json());

//allow cors
// app.use(cors({
//   origin: "http://localhost:5173"
// }))
// const allowedOrigins = ['http://localhost:5174','https://www.trusted-website.com'];
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://www.trusted-website.com",
  "https://pos-react-v1-gmqj.vercel.app"
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // Optional: configure other settings like methods and headers
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Set to true if your API uses cookies/sessions
};
app.use(cors(corsOptions)); // Apply the CORS middleware())

//for file upload for allow upload size file
app.use(
  fileUpload({
    limits: { fileSize: 30 * 1024 * 1024 }, //30MB
    createParentPath: true,
  }),
);

app.use("/testing", testingRoutes);

//allow can upload file show on  browser
app.use(
  "/uploads/products",
  express.static(path.join(process.cwd(), "uploads/products")),
);

//category
app.use("/api/v1/category", middleWareRoutes, categoryRoutes);

//product
app.use("/api/v1/product", middleWareRoutes, productRoutes);

//order
app.use("/api/v1/order", middleWareRoutes, orderRoutes);

//auth
app.use("/api/v1/auth", authRoutes);

//product-image
app.use("/api/v1/product-image", productImageRoutes);

//testOrder
app.use("/api/v1/test-order", testOrderRotes);

//pagination & search
app.use("/api/v1/products", middleWareRoutes, paginationRoutes);

//order report
app.use("/api/v1/order-report", orderReportRoutes);

//payment
app.use("/api/v1/payments", middleWareRoutes, paymentRoute);

//health check
app.get("/api/v1/health", (req, res) => {
  return res.json({
    message: "OK",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
