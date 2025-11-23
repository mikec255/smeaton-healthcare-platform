# Azure Blob Storage Setup for Production

This application uses different storage providers for blog images depending on the environment:
- **Development (Replit)**: Uses Replit's Google Cloud Storage sidecar
- **Production (Azure)**: Uses Azure Blob Storage

## Prerequisites

1. Azure Storage Account
2. Azure Storage Container for blog images

## Setup Instructions

### 1. Create Azure Storage Account

1. Log in to [Azure Portal](https://portal.azure.com)
2. Create a new Storage Account
3. Choose your resource group and region
4. Select "Standard" performance tier
5. Enable "Blob public access" on the storage account

### 2. Create Blob Container

1. Navigate to your Storage Account
2. Go to "Containers" under "Data Storage"
3. Click "+ Container"
4. Name it `blog-images` (or your preferred name)
5. Set "Public access level" to **"Blob (anonymous read access for blobs only)"**

### 3. Get Connection String

1. In your Storage Account, go to "Access keys"
2. Copy the "Connection string" from key1 or key2
3. It will look like: `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net`

### 4. Configure Environment Variables

Add these environment variables to your Azure deployment:

```bash
# Required for Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="<your-connection-string-from-step-3>"

# Optional: Custom container name (defaults to 'blog-images')
AZURE_STORAGE_CONTAINER_NAME="blog-images"
```

### 5. Deploy to Azure

Once environment variables are set, the application will automatically:
- Detect Azure environment
- Use Azure Blob Storage for blog images
- Create the container if it doesn't exist
- Generate secure SAS tokens for uploads

## How It Works

The application uses a provider-based architecture:

1. **Development (Replit)**:
   - No Azure variables set
   - Uses Replit's object storage sidecar
   - Works out of the box

2. **Production (Azure)**:
   - `AZURE_STORAGE_CONNECTION_STRING` is set
   - Switches to Azure Blob Storage provider
   - Images stored in Azure, fully cached and CDN-ready

## Testing

After setup, test by:
1. Navigate to Admin → Blog
2. Create a new blog post
3. Upload an image
4. Image should upload to Azure Blob Storage
5. Check Azure Portal → Storage Account → Containers → blog-images to verify

## Troubleshooting

**Upload fails with "AZURE_STORAGE_CONNECTION_STRING not set"**
- Verify environment variable is set correctly in Azure App Service Configuration

**Upload fails with "Invalid connection string"**
- Ensure you copied the full connection string including all parameters
- Check for extra spaces or line breaks

**Images not visible after upload**
- Verify container public access is set to "Blob"
- Check the blob URL is accessible in a browser

**Container not created automatically**
- Check your storage account has permissions to create containers
- Manually create the container in Azure Portal with public blob access

## Architecture

The system uses a pluggable storage interface (`storage-providers.ts`):
- `ReplitStorageProvider`: Google Cloud Storage via Replit sidecar
- `AzureBlobStorageProvider`: Azure Blob Storage
- `getStorageProvider()`: Factory function that selects provider based on environment

This allows seamless switching between development and production environments without code changes.
