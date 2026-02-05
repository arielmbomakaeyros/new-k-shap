import 'reflect-metadata';
import { connect, disconnect, Types } from 'mongoose';
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { FileUploadSchema, FileUpload } from '../database/schemas/file-upload.schema';
import { CompanySchema, Company } from '../database/schemas/company.schema';
import { model } from 'mongoose';

const argv = process.argv.slice(2);
const getArg = (name: string) => {
  const index = argv.findIndex((arg) => arg === `--${name}`);
  if (index === -1) return undefined;
  return argv[index + 1];
};

const companyId = getArg('companyId');
const fromPrefix = getArg('fromPrefix');
const toPrefix = getArg('toPrefix');
const dryRun = argv.includes('--dryRun');

if (!companyId || !fromPrefix || !toPrefix) {
  // eslint-disable-next-line no-console
  console.error('Usage: ts-node src/scripts/migrate-file-prefix.ts --companyId <id> --fromPrefix <old> --toPrefix <new> [--dryRun]');
  process.exit(1);
}

const normalizeSegment = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normalizePath = (value: string) =>
  value
    .split('/')
    .map((segment) => normalizeSegment(segment))
    .filter(Boolean)
    .join('/');

const bucketName = process.env.BUCKETNAME || 'kshap-uploads';
const rootPrefix = normalizeSegment(process.env.S3_ROOT_PREFIX || '');
const fromNormalized = normalizePath(fromPrefix);
const toNormalized = normalizePath(toPrefix);
const fromBase = fromNormalized.startsWith(rootPrefix) || !rootPrefix
  ? fromNormalized
  : [rootPrefix, fromNormalized].filter(Boolean).join('/');
const toBase = toNormalized.startsWith(rootPrefix) || !rootPrefix
  ? toNormalized
  : [rootPrefix, toNormalized].filter(Boolean).join('/');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      }
    : undefined,
});

const FileUploadModel = model(FileUpload.name, FileUploadSchema);
const CompanyModel = model(Company.name, CompanySchema);

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await connect(process.env.MONGODB_URI);

  const company = await CompanyModel.findById(companyId).lean();
  if (!company) {
    throw new Error('Company not found');
  }

  const prefixRegex = new RegExp(`^${fromBase}/`);
  const files = await FileUploadModel.find({
    company: new Types.ObjectId(companyId),
    s3Key: { $regex: prefixRegex },
  }).lean();

  // eslint-disable-next-line no-console
  console.log(`Found ${files.length} files to migrate from ${fromBase} to ${toBase}`);

  for (const file of files) {
    const oldKey = file.s3Key;
    const suffix = oldKey.replace(prefixRegex, '');
    const newKey = `${toBase}/${suffix}`;
    const newUrl = `https://${bucketName}.s3.amazonaws.com/${newKey}`;

    // eslint-disable-next-line no-console
    console.log(`${oldKey} -> ${newKey}`);

    if (dryRun) {
      continue;
    }

    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldKey}`,
        Key: newKey,
      }),
    );

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: oldKey,
      }),
    );

    await FileUploadModel.updateOne(
      { _id: file._id },
      {
        $set: {
          s3Key: newKey,
          storedName: newKey,
          url: newUrl,
        },
      },
    );
  }

  await disconnect();
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
