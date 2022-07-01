const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

// Middle-Wire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b4g6x.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const billCollection = client.db('powerHack').collection('bills');

    // Inserting new bill
    app.post('/add-billing', async (req, res) => {
      const bill = req.body;
      const result = await billCollection.insertOne(bill);
      res.json(result);
    });

    app.get('/billing-listing', async (req, res) => {
      const cursor = billCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // Find Single bill
    app.get('/bill/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await billCollection.findOne(query);
      res.json(result);
    });

    //Find All Bills with pagination
    app.get('/billing-list', async (req, res) => {
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const cursor = billCollection.find({});
      const count = await cursor.count();
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

    //Update pending status
    app.put('/update-billing/:id', async (req, res) => {
      const id = req.params.id;
      const updatedBill = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedBill.name,
          email: updatedBill.email,
          phone: updatedBill.phone,
          paidAmount: updatedBill.paidAmount,
        },
      };
      const result = await billCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //Delete A bill
    app.delete('/delete-billing/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await billCollection.deleteOne(query);
      res.json(result);
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
