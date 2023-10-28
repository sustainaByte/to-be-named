import { ValidationError } from "@nestjs/common"

import { ErrorResponse, SuccessResponse } from "src/@types/index"

export function formatErrorResponse(error: ErrorResponse) {
  // TODO: add status code in response
  return {
    errors: [{ message: error.message, code: "1" }],
  }
}

export class FormatErrorResponseDto {
  errors: { message: string }[]

  constructor(errors: ValidationError[]) {
    this.errors = errors.map((error) => ({
      message: error.toString(),
      code: "1",
    }))
  }
}

export function formatSuccessResponseDto<T>(
  data: T,
  ...attributes: (keyof T)[]
): SuccessResponse<T> {
  const attributesObject: Partial<T> = {}
  attributes.forEach((attribute) => {
    attributesObject[attribute] = data[attribute]
  })

  const response: SuccessResponse<T> = {
    data: attributesObject as T,
  }

  return response
}

export function formatSuccessResponse(data) {
  return {
    data,
  }
}
