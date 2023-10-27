import { Injectable, BadRequestException } from "@nestjs/common"
import * as nodemailer from "nodemailer"

import { CustomLogger, formatErrorResponse } from "src/utils/index"

@Injectable()
export class EmailService {
  constructor(private readonly logger: CustomLogger) {}

  async sendCustomEmail(type: string, email: string, content: string) {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_SERVICE_USER,
        pass: process.env.MAIL_SERVICE_PASS,
      },
    })

    const message = `Your ${type} is: ${content}`

    const mailOptions = {
      from: process.env.MAIL_SERVICE_USER,
      to: email,
      subject: type,
      text: message,
    }

    try {
      await transporter.sendMail(mailOptions)
      this.logger.log(`${type} sent to ${email}`)
    } catch (error) {
      this.logger.error(error)
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
