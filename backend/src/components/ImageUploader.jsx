import React, { useState } from 'react';
import { Image, X, Plus } from 'lucide-react';
import './ImageUploader.css';

const ImageUploader = ({ onImagesChange, max = 3 }) => {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Total count check
    if (previews.length + files.length > max) {
      alert(`You can only upload up to ${max} images.`);
      return;
    }

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    onImagesChange(updatedPreviews.map(p => p.file));
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previews];
    // Clean up memory
    URL.revokeObjectURL(updatedPreviews[index].url);
    updatedPreviews.splice(index, 1);
    
    setPreviews(updatedPreviews);
    onImagesChange(updatedPreviews.map(p => p.file));
  };

  return (
    <div className="image-uploader-wrapper">
      <div className="uploader-header">
        <label className="uploader-label">
          <Image size={14} /> Attach Photos
        </label>
        <span className="image-count">{previews.length} of {max} images</span>
      </div>

      <div className="previews-container">
        {previews.map((preview, idx) => (
          <div key={idx} className="image-preview-card">
            <img src={preview.url} alt="upload preview" />
            <button 
              type="button" 
              className="remove-img-btn"
              onClick={() => removeImage(idx)}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {previews.length < max && (
          <label className="add-image-box">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
              className="hidden-file-input"
            />
            <Plus size={24} />
            <span>Add Photo</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
