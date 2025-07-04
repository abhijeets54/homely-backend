# BackendHomely

## Cloudinary Integration

This project uses Cloudinary for image storage and optimization. To set up Cloudinary:

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)

2. Set up environment variables:
   - Add the following variables to your `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Replace the placeholder values with your actual Cloudinary credentials from your Cloudinary dashboard.

## Image Upload API

The backend provides API endpoints for uploading images to Cloudinary:

- `POST /api/upload`: Upload an image file to Cloudinary
  - Requires authentication
  - Accepts form data with `image` field (file) and `folder` field (string)
  - Returns Cloudinary URL and public ID

- `POST /api/upload/url`: Upload an image from a URL to Cloudinary
  - Requires authentication
  - Accepts JSON with `imageUrl` and `folder` fields
  - Returns Cloudinary URL and public ID

Example usage with axios:

```javascript
// Upload a file
const formData = new FormData();
formData.append('image', fileObject);
formData.append('folder', 'food');

const response = await axios.post('/api/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});

// Response contains secure_url and public_id
const imageUrl = response.data.secure_url;
```
