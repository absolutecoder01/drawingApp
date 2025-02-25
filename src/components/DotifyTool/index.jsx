import { useRef, useState } from 'react';

const DotifyTool = ({ onClose, setAddedImages }) => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [dotRadius, setDotRadius] = useState(5); // Default dot radius

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToDots = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      // Clear the canvas for dot drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < canvas.height; y += dotRadius * 2) {
        for (let x = 0; x < canvas.width; x += dotRadius * 2) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          if (a > 0) {
            // Calculate brightness (luminance) for grayscale effect
            const brightness = 0.3 * r + 0.59 * g + 0.11 * b;

            // Use brightness as the grayscale value
            const grayValue = Math.round(brightness);

            // Only draw if the pixel is not transparent
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue}, ${a / 255})`;
            ctx.fill();
          }
        }
      }
    };
  };

  const save = () => {
    const canvas = canvasRef.current;
    const canvasDataURL = canvas.toDataURL(); // Get the data URL of the canvas
    setAddedImages((prevImages) => [...prevImages, { src: canvasDataURL, x: 0, y: 0 }]); // Save the data URL to the state
  };

  return (
    <div
      className='wrapper position-absolute d-flex justify-content-center align-items-center text-dark'
      onClick={onClose}
    >
      <div
        className='text-center dotify-window d-flex flex-column align-items-center mt-4 p-2 position-relative'
        onClick={(e) => e.stopPropagation()}
      >
        <h1>Dotify Tool</h1>
        <div
          className='close-btn position-absolute d-flex justify-content-center align-items-center'
          onClick={onClose}
        >
          x
        </div>
        <input className='mt-4 ms-4' type='file' accept='image/*' onChange={handleImageUpload} />
        <label className='mt-3'>
          Dot Radius:
          <input
            type='range'
            min='1'
            max='20'
            value={dotRadius}
            onChange={(e) => setDotRadius(e.target.value)}
          />
          <span>{dotRadius}</span>
        </label>

        <h2 className='mt-4'>Original Image</h2>
        {image ? (
          <img className='original-image' src={image} alt='Uploaded' />
        ) : (
          <div className='original-image' />
        )}

        <div className='mt-3'>
          <button onClick={convertToDots}>Convert to Dots</button>
        </div>

        <h2 className='mt-4'>Result: </h2>
        <canvas ref={canvasRef} />

        {image && (
          <button className='mt-3' onClick={save}>
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default DotifyTool;
