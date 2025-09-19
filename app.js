const methodOverride = require("method-override");
const sequelize = require("./configs/database");
const cookieParser = require("cookie-parser");
const express = require("express");
require("dotenv").config();

// Import all models
const City = require("./models/City");
const District = require("./models/District");
const Favorite = require("./models/Favorite");
const House = require("./models/House");
const Report = require("./models/Report");
const Reset = require("./models/Reset");
const User = require("./models/User");

// Import middleware
const addToLocals = require("./middlewares/addToLocals");

// Import routes
const searchRoutes = require("./routes/searches");
const authRoutes = require("./routes/auths");
const accountRoutes = require("./routes/accounts");
const houseRoutes = require("./routes/houses");
const reportRoutes = require("./routes/reports");
const adminRoutes = require("./routes/admins");

// Set up associations
House.belongsTo(User, {
  foreignKey: {
    allowNull: false,
    field: "seller",
  },
});

House.belongsTo(City, {
  foreignKey: {
    allowNull: false,
    field: "city",
  },
});

House.belongsTo(District, {
  foreignKey: {
    allowNull: false,
    field: "district",
  },
});

District.belongsTo(City, {
  foreignKey: {
    allowNull: false,
    field: "cityId",
  },
});

Favorite.belongsTo(User, {
  foreignKey: {
    field: "userId",
    allowNull: false,
  },
});

Favorite.belongsTo(House, {
  foreignKey: {
    field: "houseId",
    allowNull: false,
  },
});

Report.belongsTo(House, {
  foreignKey: {
    allowNull: false,
  },
});

Reset.belongsTo(User, {
  foreignKey: {
    allowNull: false,
  },
});

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(addToLocals);
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);

// ROUTES
app.use("/", searchRoutes);
app.use("/auth", authRoutes);
app.use("/accounts", accountRoutes);
app.use("/houses", houseRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);
app.get("*", (req, res) => {
  const { q } = req.query;
  res.render("notfound", { search: false, q });
});

// Sync all models with the database
sequelize.sync({ force: false }) // Set force to true if you want to drop and recreate tables
  .then(() => {
    console.log("Database synchronized");
    app.listen(PORT, () => {
      console.log(`App is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Unable to sync database:", err);
  });
