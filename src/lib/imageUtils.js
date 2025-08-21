import React from 'react';

export const formatGoogleDriveImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }
  // For Cloudinary or other direct image URLs, no special formatting is needed.
  // The URL is returned as is.
  return url;
};