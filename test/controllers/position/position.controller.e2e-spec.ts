import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "src/app.module"
import { CanActivate, INestApplication } from "@nestjs/common"
import * as request from "supertest"
import * as jwt from "jsonwebtoken"
import { Types } from "mongoose"

import { RolesGuard } from "src/guards/RolesGuard"

describe("PositionController (e2e)", () => {
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

  it("/positions (GET)", async () => {
    await request(app.getHttpServer())
      .get("/positions")
      .set("authorization", `Bearer ${token}`)
      .expect(200)
  })
  it("/positions (POST)", async () => {
    const createPositionDto = {
      name: "Test",
    }
    await request(app.getHttpServer())
      .post("/positions")
      .set("authorization", `Bearer ${token}`)
      .send(createPositionDto)
      .expect(201)
  })
})
