import { Storage, File } from "@google-cloud/storage";
import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from "@azure/storage-blob";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export interface StorageProvider {
  getUploadURL(contentType?: string): Promise<string>;
  makePublic(fileUrl: string): Promise<void>;
  normalizeUrl(rawUrl: string): string;
}

// Replit Google Cloud Storage provider (for development)
export class ReplitStorageProvider implements StorageProvider {
  private client: Storage;
  private privateObjectDir: string;

  constructor() {
    this.client = new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token",
          },
        },
        universe_domain: "googleapis.com",
      },
      projectId: "",
    });

    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error("PRIVATE_OBJECT_DIR not set");
    }
    this.privateObjectDir = dir;
  }

  async getUploadURL(contentType?: string): Promise<string> {
    const objectId = randomUUID();
    const fullPath = `${this.privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = this.parseObjectPath(fullPath);

    return this.signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  async makePublic(fileUrl: string): Promise<void> {
    // For Replit, we don't need to make files public as they use signed URLs
    // Just track the ACL metadata
  }

  normalizeUrl(rawUrl: string): string {
    if (!rawUrl.startsWith("https://storage.googleapis.com/")) {
      return rawUrl;
    }

    const url = new URL(rawUrl);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.privateObjectDir;
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  private parseObjectPath(fullPath: string): { bucketName: string; objectName: string } {
    if (!fullPath.startsWith("/")) {
      throw new Error("Path must start with /");
    }

    const parts = fullPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new Error("Invalid object path");
    }

    const bucketName = parts[0];
    const objectName = parts.slice(1).join("/");
    return { bucketName, objectName };
  }

  private async signObjectURL({
    bucketName,
    objectName,
    method,
    ttlSec,
  }: {
    bucketName: string;
    objectName: string;
    method: string;
    ttlSec: number;
  }): Promise<string> {
    const bucket = this.client.bucket(bucketName);
    const file = bucket.file(objectName);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: method === "PUT" ? "write" : "read",
      expires: Date.now() + ttlSec * 1000,
    });

    return url;
  }
}

// Azure Blob Storage provider (for production)
export class AzureBlobStorageProvider implements StorageProvider {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  private accountName: string;
  private accountKey: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "blog-images";

    if (!connectionString) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING not set");
    }

    // Extract account name and key from connection string
    const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);

    if (!accountNameMatch || !accountKeyMatch) {
      throw new Error("Invalid AZURE_STORAGE_CONNECTION_STRING format");
    }

    this.accountName = accountNameMatch[1];
    this.accountKey = accountKeyMatch[1];
    this.containerName = containerName;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async getUploadURL(contentType?: string): Promise<string> {
    const blobId = randomUUID();
    const blobName = `uploads/${blobId}`;

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    
    // Ensure container exists
    await containerClient.createIfNotExists({ access: "blob" });

    const blobClient = containerClient.getBlobClient(blobName);

    // Generate SAS token for upload
    const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("cw"), // create, write
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
      sharedKeyCredential
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }

  async makePublic(fileUrl: string): Promise<void> {
    // Azure blobs with container access set to "blob" are already publicly readable
    // No action needed
  }

  normalizeUrl(rawUrl: string): string {
    // Azure blob URLs are already in the correct format
    // Just remove SAS tokens if present
    const url = new URL(rawUrl);
    return `${url.protocol}//${url.host}${url.pathname}`;
  }
}

// Factory function to get the appropriate storage provider
export function getStorageProvider(): StorageProvider {
  const useAzure = process.env.USE_AZURE_STORAGE === "true" || process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (useAzure) {
    console.log("Using Azure Blob Storage provider");
    return new AzureBlobStorageProvider();
  } else {
    console.log("Using Replit Storage provider");
    return new ReplitStorageProvider();
  }
}
