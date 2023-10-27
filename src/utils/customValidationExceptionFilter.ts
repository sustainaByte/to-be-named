import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common"
import { ValidationError } from "class-validator"
import { Response } from "express"

import { FormatErrorResponseDto } from "src/utils/index"

@Catch(ValidationError)
export class CustomValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const formattedErrors = new FormatErrorResponseDto([exception])

    response.status(400).json(formattedErrors)
  }
}
