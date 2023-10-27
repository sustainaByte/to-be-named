import { CanActivate, INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import * as request from "supertest"
import * as jwt from "jsonwebtoken"
import { Types } from "mongoose"

import { AppModule } from "src/app.module"
import { RolesGuard } from "src/guards/RolesGuard"

describe("DepartmentController (e2e)", () => {
  let app: INestApplication
  const fakeGuard: CanActivate = { canActivate: () => true }
  const token = jwt.sign(
    {
      roles: [process.env.TEST_ADMIN_ROLE_ID],
      organizationId: new Types.ObjectId(),
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.RESET_JWT_TOKEN_EXPIRE },
  )
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(RolesGuard)
      .useValue(fakeGuard)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it("/GET departments", async () => {
    await request(app.getHttpServer())
      .get("/departments")
      .set("authorization", `Bearer ${token}`)
      .expect(200)
  })
  it("/departments (POST)", async () => {
    const createDepartmentDto = {
      name: "Test Department32",
      description: "Test Description",
    }
    await request(app.getHttpServer())
      .post("/departments")
      .set("authorization", `Bearer ${token}`)
      .send(createDepartmentDto)
      .expect(201)
  })
})
