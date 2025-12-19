import request from "supertest";
import app from "../app";

describe("RBAC Protection", () => {
  it("should block access without token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });
});
