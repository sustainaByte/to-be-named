import { LoggerService } from "@nestjs/common"

import { Logger } from "../@types/index"

export class CustomLogger implements LoggerService {
  log(message: string) {
    const log: Logger = {
      message,
      timestamp: new Date(),
      env: process.env.NODE_ENV || "development",
      level: "info",
    }
    console.log(JSON.stringify(log, null, 2))
  }

  error(message: string) {
    const log: Logger = {
      message,
      timestamp: new Date(),
      env: process.env.NODE_ENV,
      level: "error",
    }
    console.error(JSON.stringify(log, null, 2))
  }

  warn(message: string) {
    const log: Logger = {
      message,
      timestamp: new Date(),
      env: process.env.NODE_ENV,
      level: "warn",
    }
    console.warn(JSON.stringify(log, null, 2))
  }
}
