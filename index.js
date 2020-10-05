let express = require('express');
let cors = require("cors");
let bodyParser = require("body-parser");
let MongoClient = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectId;
require('dotenv').config();

let app = express();

let uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vpsgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('welcome back')
})


client.connect(err => {
    let eventsCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLL_1);
    let volunteersCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLL_2);

    app.post('/addEvent', (req, res) => {
        let event = req.body;
        eventsCollection.insertMany(event)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount);
            })
    }),

        app.get('/events', (req, res) => {
            eventsCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        }),

        app.post('/addVolunteer', (req, res) => {
            let volunteer = req.body;
            volunteersCollection.insertOne(volunteer)
                .then(result => {
                    res.send(result.insertedCount > 0);
                })
        }),

        app.get('/registeredEvents', (req, res) => {
            volunteersCollection.find({ email: req.query.email })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        }),

        app.get('/volunteers', (req, res) => {
            volunteersCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        }),

        app.delete('/delete/:id', (req, res) => {
            volunteersCollection.deleteOne({ _id: ObjectId(req.params.id) })
                .then(result => {
                    res.send(result.deletedCount > 0);
                })
        })
});

let port = process.env.PORT || 5000;

app.listen(port);