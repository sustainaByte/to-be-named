import { Test, TestingModule } from "@nestjs/testing"
import { CanActivate, INestApplication } from "@nestjs/common"
import * as request from "supertest"
import * as jwt from "jsonwebtoken"
import * as dotenv from "dotenv"

import { AppModule } from "src/app.module"
import { RolesGuard } from "src/guards/RolesGuard"

dotenv.config()

describe("ProjectController (e2e)", () => {
  let app: INestApplication
  const fakeGuard: CanActivate = { canActivate: () => true }
  const token = jwt.sign(
    {
      roles: [process.env.TEST_ADMIN_ROLE_ID],
      organizationId: process.env.TEST_ORGANIZATION_ID,
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

  it("/projects?departmentId (GET)", async () => {
    const response = await request(app.getHttpServer())
      .get(`/projects?departmentId=${process.env.TEST_DEPARTMENT_ID}`)
      .set("Authorization", `Bearer ${token}`)
    expect(response.status).toBe(200)
  })
  it("/projects", async () => {
    const response = await request(app.getHttpServer())
      .get(`/projects`)
      .set("Authorization", `Bearer ${token}`)
    expect(response.status).toBe(200)
  })
  it("/projects/:projectId (GET)", async () => {
    const response = await request(app.getHttpServer())
      .get(`/projects/${process.env.TEST_PROJECT_ID}`)
      .set("Authorization", `Bearer ${token}`)
    expect(response.status).toBe(200)
  })
})
