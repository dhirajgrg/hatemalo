import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadToImageKit = async (file) => {
  const result = await imagekit.upload({
    file: file.buffer,
    fileName: `${Date.now()}-${file.originalname}`,
    folder: "/hatemalo/listings",
  });
  return result.url;
};

export const deleteFromImageKit = async (fileUrl) => {
  try {
    const files = await imagekit.listFiles({
      searchQuery: `url="${fileUrl}"`,
    });
    if (files.length > 0) {
      await imagekit.deleteFile(files[0].fileId);
    }
  } catch {
    // silent - don't fail if image deletion fails
  }
};

export default imagekit;
