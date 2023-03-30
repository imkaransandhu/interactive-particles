const { BlobServiceClient } = require("@azure/storage-blob");
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default async function updateblob(req, res) {
  // Create a BlobServiceClient object using your connection string
  const { name, imgData } = req.body;
  const accountName = process.env.ACCOUNT_NAME;
  const key = process.env.AZURE_BLOB_KEY;

  const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${key};EndpointSuffix=core.windows.net`;
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);

  // Create a container client
  const containerName = process.env.CONTAINER_GALLERY;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Set up the blob options
  const blobName = name;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Converting the dataURI to a buffer
  const buffer = Buffer.from(imgData.split(",")[1], "base64");

  // Uploading the buffer or blob to the storage
  const response = await blockBlobClient.upload(buffer, buffer.length);

  res.send(response);
}
