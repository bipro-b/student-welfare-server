const express = require('express')
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express()

const port = process.env.PORT || 5000


// middleware
app.use(cors());
// Get data from client site
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2bif.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {
        await client.connect();
        console.log('database connected');
        const database = client.db('studentDb');
        const membersCollection = database.collection('members');
        const usersCollection = database.collection('users');
        const appliesCollection = database.collection('applies');
        const reviewCollection = database.collection('review');
        const paymentCollection = database.collection('payment');

        // Get members API

        app.get('/members', async (req, res) => {
            const cursor = membersCollection.find({});
            const members = await cursor.toArray();
            res.send(members);
        })
        // get apply API
        app.get('/applies', async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email }
            }
            const cursor = appliesCollection.find(query);
            const applies = await cursor.toArray();
            res.send(applies);
        });

        // get payment 
        app.get('/payments', async (req, res) => {
            const cursor = paymentCollection.find({});
            const pay = await cursor.toArray();
            res.send(pay)
        })

        // get review API
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })
        // get Admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role == 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // Post members api

        app.post('/members', async (req, res) => {
            const car = req.body;
            console.log('hit the post', car)

            const result = await membersCollection.insertOne(car);
            res.json(result);
        })

        // post user API

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result);
        })

        // get users
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const user = await cursor.toArray();
            res.send(user);
        })

        // post apply API

        app.post('/applies', async (req, res) => {
            const order = req.body;
            const result = await appliesCollection.insertOne(order);
            res.json(result);
        })



        //  post payment  
        app.post('/payments', async (req, res) => {
            const pay = req.body;
            console.log('hit the post', pay)

            const result = await paymentCollection.insertOne(pay);
            res.json(result);
        })
        // post review API
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })
        // update

        app.put('/users', async (req, res) => {

            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true }
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // admin

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        // Delete car API

        app.delete('/members/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await membersCollection.deleteOne(query);
            console.log('delete', result)
            res.json(result);
        })

        // delete order API
        app.delete('/applies/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await appliesCollection.deleteOne(query);
            console.log('delete', result)
            res.json(result);
        })


    }
    finally {
        // await client.close()
    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})