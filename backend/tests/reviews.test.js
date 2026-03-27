/**
 * tests/reviews.test.js
 * Integration tests for /api/reviews using supertest + in-memory MongoDB.
 */

"use strict";

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

// Set MONGODB_URI BEFORE requiring server.js so connectDB() has it available
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Require app AFTER mongo is connected
const request = require("supertest");
const app     = require("../server");

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/reviews", () => {
  it("returns empty array initially", async () => {
    const res = await request(app).get("/api/reviews");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns reviews newest-first", async () => {
    await request(app).post("/api/reviews").send({ comment: "First" });
    await new Promise((r) => setTimeout(r, 10));
    await request(app).post("/api/reviews").send({ comment: "Second" });

    const res = await request(app).get("/api/reviews");
    expect(res.body[0].comment).toBe("Second");
    expect(res.body[1].comment).toBe("First");
  });
});

describe("POST /api/reviews", () => {
  it("creates a review with name and comment", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .send({ name: "Tester", comment: "Great portfolio!" });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Tester");
    expect(res.body.comment).toBe("Great portfolio!");
    expect(res.body.createdAt).toBeDefined();
  });

  it("defaults name to Anonymous when omitted", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .send({ comment: "No name here" });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Anonymous");
  });

  it("returns 400 when comment is missing", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .send({ name: "Someone" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("returns 400 when comment is empty string", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .send({ comment: "   " });

    expect(res.statusCode).toBe(400);
  });
});