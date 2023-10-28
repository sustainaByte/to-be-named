import { BadRequestException } from "@nestjs/common"

import { formatErrorResponse } from "./responseHelper"

export function checkEqualFields(toValidateField: string, field: string) {
  if (toValidateField !== field) {
    throw new BadRequestException(
      formatErrorResponse({ message: "Fields mismatch" }),
    )
  }
}
