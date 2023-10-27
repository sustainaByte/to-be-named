import { BadRequestException } from "@nestjs/common"
import { formatErrorResponse } from "src/utils/index"

export function checkIdFormat(idToCheck) {
  if (!idToCheck.toString().match(/^[0-9a-fA-F]{24}$/)) {
    throw new BadRequestException(
      formatErrorResponse({ message: "Invalid objectId format." }),
    )
  }
}
