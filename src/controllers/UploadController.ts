import {
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { UploadService } from "../services/UploadService"

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 3e7 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const imageUrl = await this.uploadService.upload(
        file.originalname,
        file.buffer,
      )

      return { imageUrl }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  @Get()
  async getFile(@Param(":url") url: string, @Res() res: Response) {
    try {
      const fileStream = await this.uploadService.getFile(
        this.extractFileName(url),
      )

      fileStream.pipe(res)
    } catch (error) {
      console.error("Error getting file:", error)
    }
  }

  private extractFileName(url: any): string {
    const strUrl = String(url)
    const parts = strUrl.split("/")
    return parts[parts.length - 1]
  }
}
