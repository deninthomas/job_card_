import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 } from 'uuid';


const s3Client = new S3Client({
    region: process.env.AWS_REGION, credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID! || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export const GenerateUploadUrl = async (fileName: string, fileType: string): Promise<{ url: string, key: string }> => {

    let params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${v4()}-${fileName}`,
        ContentType: fileType,
    };

    const command = new PutObjectCommand(params);

    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url: uploadURL, key: params.Key };

}