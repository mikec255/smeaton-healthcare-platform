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
  private sharedKeyCredential: StorageSharedKeyCredential;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "blog-images";

    if (!connectionString) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING not set. Please configure Azure Blob Storage credentials.");
    }

    // Extract account name and key from connection string (SECURITY: Consider using managed identity instead)
    const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);

    if (!accountNameMatch || !accountKeyMatch) {
      throw new Error("Invalid AZURE_STORAGE_CONNECTION_STRING format. Expected format: DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net");
    }

    const accountName = accountNameMatch[1];
    const accountKey = accountKeyMatch[1];

    this.containerName = containerName;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    // Validate container exists on initialization
    this.validateContainer().catch(err => {
      console.error("Warning: Azure Blob Storage container validation failed:", err.message);
      console.error("Uploads may fail until the container is properly configured.");
    });
  }

  private async validateContainer(): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const exists = await containerClient.exists();
      
      if (!exists) {
        console.log(`Container '${this.containerName}' does not exist. Attempting to create...`);
        try {
          await containerClient.create({ access: "blob" });
          console.log(`Successfully created container '${this.containerName}' with public blob access`);
        } catch (createError: any) {
          throw new Error(`Failed to create container: ${createError.message}. Please create it manually in Azure Portal.`);
        }
      } else {
        console.log(`Azure Blob Storage container '${this.containerName}' validated successfully`);
      }
    } catch (error: any) {
      throw new Error(`Container validation failed: ${error.message}`);
    }
  }

  async getUploadURL(contentType?: string): Promise<string> {
    const blobId = randomUUID();
    const blobName = `uploads/${blobId}`;

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Generate time-limited SAS token for upload only
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("cw"), // create, write only
        startsOn: new Date(Date.now() - 5 * 60 * 1000), // Start 5 min ago to handle clock skew
        expiresOn: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
      },
      this.sharedKeyCredential
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }

  async makePublic(fileUrl: string): Promise<void> {
    // Azure blobs with container access set to "blob" are already publicly readable
    // No additional action needed - public access is configured at container level
  }

  normalizeUrl(rawUrl: string): string {
    try {
      // Azure blob URLs: Remove SAS tokens to get clean public URL
      const url = new URL(rawUrl);
      return `${url.protocol}//${url.host}${url.pathname}`;
    } catch (error) {
      // If URL parsing fails, return as-is
      return rawUrl;
    }
  }
}

// Factory function to get the appropriate storage provider
export function getStorageProvider(): StorageProvider {
  // Explicit environment flag takes precedence
  const forceProvider = process.env.STORAGE_PROVIDER; // "azure" or "replit"
  
  if (forceProvider === "azure") {
    console.log("Using Azure Blob Storage provider (explicit override)");
    return new AzureBlobStorageProvider();
  }
  
  if (forceProvider === "replit") {
    console.log("Using Replit Storage provider (explicit override)");
    return new ReplitStorageProvider();
  }

  // Auto-detect: Use Azure if connection string is set AND we're not in Replit dev
  const hasAzureConfig = !!process.env.AZURE_STORAGE_CONNECTION_STRING;
  const isReplitEnv = !!process.env.REPL_ID; // Replit-specific env var

  if (hasAzureConfig && !isReplitEnv) {
    console.log("Using Azure Blob Storage provider (auto-detected from environment)");
    return new AzureBlobStorageProvider();
  } else {
    console.log("Using Replit Storage provider (default for development)");
    return new ReplitStorageProvider();
  }
}
