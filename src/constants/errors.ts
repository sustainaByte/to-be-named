export const UNAUTHORIZED_EXCEPTION = "Unauthorized, no access"
export const INVALID_REQUEST_EXCEPTION = "Invalid request"
export const NOT_FOUND_EXCEPTION = "Item not found"
export const BAD_REQUEST_EXCEPTION = "Bad request, please check your input"
export const CONFLICT_EXCEPTION = "Item already exists"
export const FORBIDDEN_EXCEPTION = "Forbidden, no access"

export const ERROR_BODY = {
  properties: {
    errors: {
      type: "array",
      items: {
        properties: {
          message: { type: "string" },
          code: { type: "string" },
        },
      },
    },
  },
}
