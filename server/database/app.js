const express = require('express');
const mongoose = require('mongoose');
const Reviews = require('./review');
const Dealerships = require('./dealership');
const { reviews } = require('./data/reviews.json');
const { dealerships } = require('./data/dealerships.json');

const app = express();
const port = process.env.PORT || 3030;
app.use(express.json());

const route = handler => (req, res, next) => handler(req, res).catch(next);

app.get('/', (req, res) => res.send('Welcome to the Mongoose API'));
app.get('/fetchReviews', route(async (req, res) => {
  res.json(await Reviews.find().sort({ id: 1 }).lean());
}));
app.get('/fetchReviews/dealer/:id', route(async (req, res) => {
  res.json(await Reviews.find({ dealership: req.params.id }).sort({ id: -1 }).lean());
}));
app.get('/fetchDealers', route(async (req, res) => {
  res.json(await Dealerships.find().sort({ id: 1 }).lean());
}));
app.get('/fetchDealers/:state', route(async (req, res) => {
  const { state } = req.params;
  res.json(await Dealerships.find({ $or: [{ state }, { st: state }] }).sort({ id: 1 }).lean());
}));
app.get('/fetchDealer/:id', route(async (req, res) => {
  res.json(await Dealerships.find({ id: req.params.id }).lean());
}));
app.post('/insert_review', route(async (req, res) => {
  if (!await Dealerships.exists({ id: req.body.dealership })) {
    return res.status(404).json({ error: 'Dealership not found' });
  }
  const counter = await mongoose.connection.collection('counters').findOneAndUpdate(
    { _id: 'review' }, { $inc: { sequence: 1 } }, { returnDocument: 'after' }
  );
  const review = await Reviews.create({ ...req.body, id: counter.sequence });
  res.status(201).json(review);
}));

app.use((error, req, res, next) => {
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  res.status(error.status || 500).json({ error: 'Request could not be completed' });
});

async function start() {
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/dealershipsDB');
  for (const [model, data] of [[Dealerships, dealerships], [Reviews, reviews]]) {
    await model.bulkWrite(data.map(entry => ({
      updateOne: { filter: { id: entry.id }, update: { $setOnInsert: entry }, upsert: true }
    })));
  }
  const latest = await Reviews.findOne().sort({ id: -1 }).lean();
  await mongoose.connection.collection('counters').updateOne(
    { _id: 'review' }, { $max: { sequence: latest.id } }, { upsert: true }
  );
  app.listen(port, process.env.HOST || '127.0.0.1', () => console.log('Dealership API listening on port', port));
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
