

import { useRef, useState } from 'react';

const DotifyTool = ({ onClose, setAddedImages }) => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [dotRadius, setDotRadius] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < canvas.height; y += dotRadius * 2) {
        for (let x = 0; x < canvas.width; x += dotRadius * 2) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          if (a > 0) {
            const brightness = 0.3 * r + 0.59 * g + 0.11 * b;
            const grayValue = Math.round(brightness);

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
    const canvasDataURL = canvas.toDataURL();
    const newImage = {
      src: canvasDataURL,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      scale: 1,
    };
    setAddedImages(prevImages => [...prevImages, newImage]);
  };

  const handleMouseDown = (e, image, type) => {
    e.stopPropagation();
    setSelectedImage(image);
    setDragStart({
      x: e.clientX - image.x,
      y: e.clientY - image.y,
    });
    if (type === 'drag') {
      setIsDragging(true);
    } else if (type === 'resize') {
      setIsResizing(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!selectedImage) return;

    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setAddedImages(prevImages =>
        prevImages.map(img =>
          img === selectedImage ? { ...img, x: newX, y: newY } : img
        )
      );
    } else if (isResizing) {
      const deltaX = e.clientX - (selectedImage.x + selectedImage.width * selectedImage.scale);
      const deltaY = e.clientY - (selectedImage.y + selectedImage.height * selectedImage.scale);
      
      // Calculate new scale based on the diagonal movement
      const diagonal = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const direction = deltaX + deltaY > 0 ? 1 : -1;
      const scaleFactor = 0.005; // Adjust this value to control resize sensitivity
      
      const newScale = Math.max(
        0.1,
        selectedImage.scale + direction * diagonal * scaleFactor
      );

      setAddedImages(prevImages =>
        prevImages.map(img =>
          img === selectedImage ? { ...img, scale: newScale } : img
        )
      );
    }
  };// pidaras, ty mozesz zrobyty papku szcze DotifyTester i kynuty tudy kod, ja jak budu doma budu dali ebaszyty

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setSelectedImage(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="bg-white rounded-lg p-6 relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-4">Dotify Tool</h2>
        
        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <span>Dot Radius:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={dotRadius}
                onChange={(e) => setDotRadius(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="w-8 text-center">{dotRadius}</span>
            </label>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Original Image</h3>
            {image ? (
              <img src={image} alt="Original" className="max-h-48 object-contain mx-auto" />
            ) : (
              <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                No image uploaded
              </div>
            )}
          </div>

          {image && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={convertToDots}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Convert to Dots
              </button>
              <button
                onClick={save}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          )}

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Result</h3>
            <canvas
              ref={canvasRef}
              className="max-w-full"
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none">
        <div className="relative w-full h-full">
          {setAddedImages(images => {
            if (!Array.isArray(images)) return [];
            return images.map((img, index) => (
              <div
                key={index}
                className="absolute cursor-move pointer-events-auto"
                style={{
                  transform: `translate(${img.x}px, ${img.y}px) scale(${img.scale})`,
                  width: img.width,
                  height: img.height,
                }}
              >
                <div
                  className="absolute inset-0"
                  onMouseDown={(e) => handleMouseDown(e, img, 'drag')}
                >
                  <img
                    src={img.src}
                    alt={`Generated ${index}`}
                    className="w-full h-full pointer-events-none"
                  />
                </div>
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize bg-white border border-gray-300 rounded-full flex items-center justify-center"
                  onMouseDown={(e) => handleMouseDown(e, img, 'resize')}
                >
                  ⤡
                </div>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
};

export default DotifyTool;





// //to ten dobry
// import { useRef, useState } from 'react';

// const DotifyTool = ({ onClose, setAddedImages }) => {
//   const canvasRef = useRef(null);
//   const [image, setImage] = useState(null);
//   const [dotRadius, setDotRadius] = useState(5); // Default dot radius

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const convertToDots = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.src = image;
//     img.onload = () => {

//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);

//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       const { data } = imageData;

//       // Clear the canvas for dot drawing
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       for (let y = 0; y < canvas.height; y += dotRadius * 2) {
//         for (let x = 0; x < canvas.width; x += dotRadius * 2) {
//           const index = (y * canvas.width + x) * 4;
//           const r = data[index];
//           const g = data[index + 1];
//           const b = data[index + 2];
//           const a = data[index + 3];

//           if (a > 0) {
//             // Calculate brightness (luminance) for grayscale effect
//             const brightness = 0.3 * r + 0.59 * g + 0.11 * b;

//             // Use brightness as the grayscale value
//             const grayValue = Math.round(brightness);

//             // Only draw if the pixel is not transparent
//             ctx.beginPath();
//             ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
//             ctx.fillStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue}, ${a / 255})`;
//             ctx.fill();
//           }
//         }
//       }
//     };
//   };

//   const save = () => {
//     const canvas = canvasRef.current;
//     const canvasDataURL = canvas.toDataURL(); // Get the data URL of the canvas
//     setAddedImages((prevImages) => [...prevImages, { src: canvasDataURL, x: 0, y: 0 }]); // Save the data URL to the state
//   };

//   return (
//     <div
//       className='wrapper position-absolute d-flex justify-content-center align-items-center text-dark'
//       onClick={onClose}
//     >
//       <div
//         className='text-center dotify-window d-flex flex-column align-items-center mt-4 p-2 position-relative'
//         onClick={(e) => e.stopPropagation()}
//       >
//         <h1>Dotify Tool</h1>
//         <div
//           className='close-btn position-absolute d-flex justify-content-center align-items-center'
//           onClick={onClose}
//         >
//           x
//         </div>
//         <input className='mt-4 ms-4' type='file' accept='image/*' onChange={handleImageUpload} />
//         <label className='mt-3'>
//           Dot Radius:
//           <input
//             type='range'
//             min='1'
//             max='20'
//             value={dotRadius}
//             onChange={(e) => setDotRadius(e.target.value)}
//           />
//           <span>{dotRadius}</span>
//         </label>

//         <h2 className='mt-4'>Original Image</h2>
//         {image ? (
//           <img className='original-image' src={image} alt='Uploaded' />
//         ) : (
//           <div className='original-image' />
//         )}

//         <div className='mt-3'>
//           <button onClick={convertToDots}>Convert to Dots</button>
//         </div>

//         <h2 className='mt-4'>Result: </h2>
//         <canvas ref={canvasRef} />

//         {image && (
//           <button className='mt-3' onClick={save}>
//             Save
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DotifyTool;

// // //Jakas hujnia
// // // import React, { useState } from 'react';

// // // const DotifyTool = () => {
// // //   const [image, setImage] = useState(null);
// // //   const [width, setWidth] = useState(100); // Default width
// // //   const [height, setHeight] = useState(100); // Default height

// // //   const handleImageUpload = (event) => {
// // //     const file = event.target.files[0];
// // //     const reader = new FileReader();
// // //     reader.onloadend = () => setImage(reader.result);
// // //     if (file) reader.readAsDataURL(file);
// // //   };

// // //   const handleResize = () => {
// // //     // Logic to resize the image based on width and height state
// // //   };

// // //   return (
// // //     <div>
// // //       <input type="file" onChange={handleImageUpload} />
// // //       {image && (
// // //         <div>
// // //           <img src={image} alt="Uploaded" style={{ width: `${width}px`, height: `${height}px` }} />
// // //           <div>
// // //             <label>
// // //               Width:
// // //               <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
// // //             </label>
// // //             <label>
// // //               Height:
// // //               <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
// // //             </label>
// // //             <button onClick={handleResize}>Resize Image</button>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default DotifyTool;