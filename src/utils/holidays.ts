import axios from "axios"
import { BASE_URL_HOLIDAY } from "src/constants"

export async function getHolidays(): Promise<any> {
  const currentYear = new Date().getFullYear()
  return axios.get(`${BASE_URL_HOLIDAY}/${currentYear}/RO`)
}

export async function checkForHoliday(date: string): Promise<boolean> {
  try {
    const response = await getHolidays()
    const holidays = response.data

    return holidays.some((holiday) => holiday.date === date)
  } catch (error) {
    throw new Error("Failed to retrieve holiday data from the API.")
  }
}
