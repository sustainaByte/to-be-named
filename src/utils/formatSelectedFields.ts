export function formatSelectedFields(filters: string[]) {
  if (filters.length === 0) return "-__v -organizationId"
  else return filters.join(" ")
}
