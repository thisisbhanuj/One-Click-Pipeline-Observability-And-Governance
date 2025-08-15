import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!
});

export async function getPrivateKey(): Promise<{ rsaKeyPath: string; rsaKeyContent: string } | null> {
    const data = await s3.getObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `${process.env.AWS_S3_BUCKET_KEY_DIR ?? ''}${process.env.AWS_S3_KEY_NAME!}`
    }).promise();

    if (!data || !data.Body) return null;

    const isProd = process.env.NODE_ENV === 'production';
    const rsaKeyPath = isProd
        ? path.join('/tmp', process.env.AWS_S3_KEY_NAME!) // serverless tmp
        : process.env.RSA_PRIVATE_KEY_PATH_LOCAL!; // local project dir

    // Ensure dir exists before writing
    fs.mkdirSync(path.dirname(rsaKeyPath), { recursive: true });
    fs.writeFileSync(rsaKeyPath, data.Body as Buffer);

    const rsaKeyContent = data.Body.toString('utf-8'); // key content as string

    return { rsaKeyPath, rsaKeyContent };
}
