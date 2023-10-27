import { Test, TestingModule } from "@nestjs/testing"
import { CanActivate, INestApplication } from "@nestjs/common"
import * as request from "supertest"
import * as jwt from "jsonwebtoken"

import { AppModule } from "src/app.module"
import { RolesGuard } from "src/guards/RolesGuard"

describe("EmployeeController (e2e)", () => {
  let app: INestApplication
  const fakeGuard: CanActivate = { canActivate: () => true }
  const token = jwt.sign(
    {
      roles: [process.env.TEST_ADMIN_ROLE_ID],
      userId: process.env.TEST_EMPLOYEE_ID,
      email: process.env.TEST_ADMIN_EMAIL,
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

  it("/employees (POST)", async () => {
    const createEmployeeDto = {
      email: "testemployee@hpm.ro",
      name: "Test",
      surname: "Test",
      phoneNumber: "3333333",
      emergencyNumber: "33333333",
      address: {
        city: "Test",
        country: "Test",
        street: "Test",
        streetNumber: "33",
      },
    }
    await request(app.getHttpServer())
      .post("/employees")
      .set("authorization", `Bearer ${token}`)
      .send(createEmployeeDto)
      .expect(201)
  })
  it("/:employeeId/timesheets?startDate?endDate (GET)", async () => {
    const startDate = process.env.TEST_START_DATE
    const endDate = process.env.TEST_END_DATE
    const employeeId = process.env.TEST_EMPLOYEE_ID
    await request(app.getHttpServer())
      .get(
        `/employees/${employeeId}/timesheets?startDate=${startDate}&endDate=${endDate}`,
      )
      .set("authorization", `Bearer ${token}`)
      .expect(200)
  })
  it("/:employeeId (PATCH)", async () => {
    const employeeId = process.env.TEST_EMPLOYEE_ID
    const updateEmployeeDto = {
      name: "Test",
      surname: "Test",
      phoneNumber: "3333333",
      emergencyNumber: "33333333",
      address: {
        city: "Test",
        country: "Test",
        street: "Test",
        streetNumber: "33",
      },
    }
    await request(app.getHttpServer())
      .patch(`/employees/${employeeId}`)
      .set("authorization", `Bearer ${token}`)
      .send(updateEmployeeDto)
      .expect(200)
  })
})
