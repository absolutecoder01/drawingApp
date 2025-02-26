import { useState } from 'react';

export const FileInput = ({ onChange }) => {
  const [imageSelected, setImageSelected] = useState(false);

  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      setImageSelected(true);
      onChange(e);
    }
  };

  return (
    <div className='file-input-container'>
      <label htmlFor='image-upload' className='file-input'>
        Select Image
      </label>
      <input
        id='image-upload'
        type='file'
        accept='image/*'
        onChange={handleChange}
        className='file-input-text'
      />
      {imageSelected && (
        <span className='text' style={{}}>
          Image Selected
        </span>
      )}
    </div>
  );
};
