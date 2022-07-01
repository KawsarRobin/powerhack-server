const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

// user: powerhack
// pass: sEI1w4iGES1p5B2V

// Middle-Wire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b4g6x.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const billCollection = client.db('powerHack').collection('bills');
    console.log('hitting db');

    // Inserting new bill
    app.post('/add-billing', async (req, res) => {
      console.log('hitting inserting single bills');
      const bill = req.body;
      const result = await billCollection.insertOne(bill);
      console.log('added new bill', result);
      res.json(result);
    });

    //Find All Bills
    app.get('/billing-list', async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const cursor = billCollection.find({});
      const count = await cursor.count();
      console.log('count is', count);
      let bills;

      if (page) {
        bills = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        bills = await cursor.toArray();
      }
      res.send({
        count,
        bills,
      });
    });

    app.get('/registration', async (req, res) => {
      res.send('');
    });
  } finally {
    // client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello server is running');
});

app.listen(port, () => {
  console.log('listening to the port', port);
});
