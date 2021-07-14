const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
const { DB_USER, DB_NAME, DB_PASS } = process.env;

app.get("/", (req, res) => {
  res.send("Hi from express!");
});

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.nua1k.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const collection = client.db(DB_NAME).collection("products");
  const orders = client.db(DB_NAME).collection("orders");

  // Add product to database
  app.post("/addProduct", (req, res) => {
    const products = req.body;
    collection.insertOne(products).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Read from database
  app.get("/products", (req, res) => {
    collection.find({}).toArray((err, docs) => {
      res.send(docs);
    });
  });

  // Read single data from database
  app.get("/product/:key", (req, res) => {
    collection.find({ key: req.params.key }).toArray((err, docs) => {
      res.send(docs[0]);
    });
  });

  // Read with list of ids/keys
  app.post("/productByKeys", (req, res) => {
    const productKeys = req.body;
    collection.find({ key: { $in: productKeys } }).toArray((err, docs) => {
      res.send(docs);
    });
  });

  // Add order
  app.post("/addOrder", (req, res) => {
    const order = req.body;
    orders.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount);
    });
  });
  //   client.close();
});

app.listen(port, (req, res) => {
  console.log(`Server is up on port ${port}`);
});
