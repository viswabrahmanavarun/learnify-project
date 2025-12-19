import request from "supertest";
import app from "../app";

describe("Student Auth", () => {
  it("registers a student", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "student@test.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
  });

  it("logs in and returns token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "student@test.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
