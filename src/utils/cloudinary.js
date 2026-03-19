import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloud = async function (localfilepath) {
    try {
        if (!localfilepath) return null;

        const result = await cloudinary.uploader.upload(localfilepath, {
            resource_type: 'auto',
        });
        console.log('Cloudinary upload success:', result.url);

        return result;
    }
    catch (error) {
        fs.unlink(localfilepath);

        console.error('Cloudinary upload fail:', error);
        return null;
    }
}
