import { BadRequestException, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"

import { AppModule } from "./app.module"
import swagger from "./utils/swagger"
import {
  FormatErrorResponseDto,
  CustomValidationExceptionFilter,
  CustomLogger,
} from "./utils/index"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  swagger(app)
  app.enableCors()
  app.useLogger(app.get(CustomLogger))
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const formattedErrors = new FormatErrorResponseDto(errors)
        return new BadRequestException(formattedErrors)
      },
    }),
    new ValidationPipe({
      whitelist: true,
    }),
  )
  app.useGlobalFilters(new CustomValidationExceptionFilter())
  await app.listen(5000, "0.0.0.0")
}
bootstrap()
