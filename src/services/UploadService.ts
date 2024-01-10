import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
    private readonly s3client = new S3Client({
        region: this.configService.getOrThrow('AWS_S3_REGION'),
    });

    constructor(private readonly configService: ConfigService) { }

    async upload(fileName: string, file: Buffer): Promise<string> {
        const uploadParams = new PutObjectCommand({
            Bucket: 'imagessustainabyte',
            Key: fileName,
            Body: file,
        });

        try {
            await this.s3client.send(uploadParams);
            const imageUrl = `https://imagessustainabyte.s3.${this.configService.getOrThrow(
                'AWS_S3_REGION',
            )}.amazonaws.com/${fileName}`;
            return imageUrl;
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw error;
        }
    }

    async getFile(fileName: string): Promise<any> {
        const getParams = new GetObjectCommand({
            Bucket: 'imagessustainabyte',
            Key: fileName,
        });

        try {
            const s3Object = await this.s3client.send(getParams);
            return s3Object.Body;
        } catch (error) {
            console.error('Error getting file from S3:', error);
            throw error;
        }
    }
}
