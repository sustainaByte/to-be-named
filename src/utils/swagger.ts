import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export default async function (app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle("Your API")
    .setDescription("API documentation for your NestJS app")
    .setVersion("1.0")
    .addBearerAuth({
      description: "Enter your Bearer token here to authenticate",
      name: "Authorization",
      in: "header",
      type: "http",
    })
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)
}
