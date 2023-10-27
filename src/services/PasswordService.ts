import { BadRequestException, Injectable } from "@nestjs/common"
import * as jwt from "jsonwebtoken"
import * as bcrypt from "bcrypt"

import { ForgotPasswordDto, ResetPasswordDto } from "src/dto"
import { CustomLogger, formatErrorResponse } from "src/utils"
import { AuthService, EmailService } from "src/services"
import { UserRepository } from "src/repositories"

@Injectable()
export class PasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly logger: CustomLogger,
    private readonly authService: AuthService,
  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    try {
      const resetToken = jwt.sign(
        { email: forgotPasswordDto.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.RESET_JWT_TOKEN_EXPIRE },
      )
      await this.emailService.sendCustomEmail(
        "Reset Password Link",
        forgotPasswordDto.email,
        `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`,
      )
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    authToken: string,
  ): Promise<void> {
    try {
      if (resetPasswordDto.currentPassword) {
        const decodedToken = await this.authService.verifyToken(authToken)
        const email = decodedToken.email
        const userId = decodedToken.userId
        const user = await this.userRepository.findById(userId)
        const isMatch = await bcrypt.compare(
          resetPasswordDto.currentPassword,
          user.password,
        )
        if (!isMatch) throw new BadRequestException("Incorrect password")

        const newPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10)
        await this.userRepository.update(
          { _id: userId },
          { password: newPassword },
        )
        this.logger.log(`User with ${email} reset their password`)
      }
      const token = resetPasswordDto.resetToken
      const decodedToken = await this.authService.verifyToken(token)
      const newPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10)

      const email = decodedToken.email
      const user = await this.userRepository.find({ email })

      await this.userRepository.update(user[0]._id, { password: newPassword })
      this.logger.log(`User with ${email} reset their password`)
    } catch (error) {
      throw new BadRequestException(formatErrorResponse(error))
    }
  }
}
