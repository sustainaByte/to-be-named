export function generateRandomPassword(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const specialChars = "!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    } else {
      password += specialChars.charAt(
        Math.floor(Math.random() * specialChars.length),
      )
    }
  }
  return password
}
