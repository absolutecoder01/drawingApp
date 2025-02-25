import { useState, useRef } from 'react';
import { FileInput } from '../FileInput';
import { getRandomColor } from 'src/utils/getRandomColor';
import { Canvas } from '../Canvas';
import { ThemeBtn } from '../ThemeBtn';
import { LanguageDropdown } from '../LanguageDropdown';
import { useTranslation } from 'src/hooks/useTranslation';
import { useSearchParams } from 'react-router-dom';
import DotifyTool from '../DotifyTool';

const dotColors = ['#ff0000', '#0000ff', '#00ff00', '#000000'];
const dotSizes = [1.88, 2.83, 3.77, 5.66];


const Comet = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([
    { x: 50, y: 50 },
    { x: 150, y: 150 },
    { x: 250, y: 50 },
  ]);
  const [rectangles, setRectangles] = useState([]);
  const [cometPaths, setCometPaths] = useState([]);
  const [showStarMenu, setShowStarMenu] = useState(false);

  const [starCountInput, setStarCountInput] = useState(10); // Default to 10 stars
  const [selectedColor, setSelectedColor] = useState(dotColors[0]); // Default to the first color
  const [selectedDiameter, setSelectedDiameter] = useState(dotSizes[0]); // Default to the first size

  const [distance, setDistance] = useState(3);
  const [randomOffset, setRandomOffset] = useState(5);
  const [showControlPoints, setShowControlPoints] = useState(false);
  const [stars, setStars] = useState([]);
  const [image, setImage] = useState(null);
  const [layers, setLayers] = useState([
    { id: 'stars', visible: true, type: 'color' },
    { id: 'comets', visible: true, type: 'comet' },
    { id: 'rectangles', visible: true, type: 'shape' },
    { id: 'image', visible: true, type: 'image', translationKey: 'image'},
  ]);
  const [shouldShowFullscreen, setShouldShowFullscreen] = useState(false);
  const [shouldShowDotifyMenu, setShouldShowDotifyMenu] = useState(false);

  const [params] = useSearchParams();
  const t = useTranslation(params.get('language') ?? 'English');

  const [addedImages, setAddedImages] = useState([]);

  const addRectangle = () => {
    const newRectangle = [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
      { x: 100, y: 300 },
      { x: 200, y: 100 },
      { x: 300, y: 200 },
      { x: 200, y: 300 },
      { x: 100, y: 200 },
      { x: 150, y: 100 },
      { x: 250, y: 100 },
      { x: 300, y: 150 },
      { x: 300, y: 250 },
      { x: 150, y: 300 },
      { x: 100, y: 150 },
      { x: 100, y: 250 },
    ];
    setRectangles([...rectangles, newRectangle]);
  };

  const toggleLayerVisibility = (layerId) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const generateComet = () => {
    if (points.length < 3) return;

    const lastZone = rectangles[rectangles.length - 1];
    const newCometPath = [];
    const cometColor = getRandomColor();

    for (let t = 0; t <= 1; t += 0.01) {
      const x =
        (1 - t) * (1 - t) * points[0].x + 2 * (1 - t) * t * points[1].x + t * t * points[2].x;
      const y =
        (1 - t) * (1 - t) * points[0].y + 2 * (1 - t) * t * points[1].y + t * t * points[2].y;

      const randomX = x + (Math.random() * randomOffset * 2 - randomOffset);
      const randomY = y + (Math.random() * randomOffset * 2 - randomOffset);

      if (isPointInPolygon({ x: randomX, y: randomY }, lastZone)) {
        newCometPath.push({ x: randomX, y: randomY });
      }
    }

    if (newCometPath.length > 0) {
      setCometPaths((prevPaths) => [...prevPaths, { path: newCometPath, color: cometColor }]);
    }
  };

  const addComet = () => setShowControlPoints(true);
  const deleteCometPoints = () => {
    setPoints([
      { x: 50, y: 50 },
      { x: 150, y: 150 },
      { x: 250, y: 50 },
    ]);
    setShowControlPoints(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => setImage(img);
      };
      reader.readAsDataURL(file);
    }
  };

  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;
      const intersect =
        yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };
  const generateStars = () => {
    const newStars = [];
    rectangles.forEach((points) => {
      const minX = Math.min(...points.map((p) => p.x));
      const maxX = Math.max(...points.map((p) => p.x));
      const minY = Math.min(...points.map((p) => p.y));
      const maxY = Math.max(...points.map((p) => p.y));

      for (let i = 0; i < starCountInput; i++) { // Use starCountInput
        let x, y;
        do {
          x = Math.random() * (maxX - minX) + minX;
          y = Math.random() * (maxY - minY) + minY;
        } while (!isPointInPolygon({ x, y }, points));

        // Use selectedDiameter and selectedColor
        newStars.push({ x, y, size: selectedDiameter, color: selectedColor });
      }
    });
    setStars((prevStars) => [...prevStars, ...newStars]);
  };
  // const generateStars = () => {
  //   const newStars = [];
  //   rectangles.forEach((points) => {
  //     const minX = Math.min(...points.map((p) => p.x));
  //     const maxX = Math.max(...points.map((p) => p.x));
  //     const minY = Math.min(...points.map((p) => p.y));
  //     const maxY = Math.max(...points.map((p) => p.y));

  //     for (let i = 0; i < 10; i++) {
  //       let x, y;
  //       do {
  //         x = Math.random() * (maxX - minX) + minX;
  //         y = Math.random() * (maxY - minY) + minY;
  //       } while (!isPointInPolygon({ x, y }, points));

  //       const diameter = dotSizes[Math.floor(Math.random() * dotSizes.length)];
  //       const color = dotColors[Math.floor(Math.random() * dotColors.length)];
  //       newStars.push({ x, y, size: diameter, color });
  //     }
  //   });
  //   setStars((prevStars) => [...prevStars, ...newStars]);
  // };

  const moveLayer = (layerId, direction) => {
    setLayers((prevLayers) => {
      const index = prevLayers.findIndex((layer) => layer.id === layerId);
      if (index === -1) return prevLayers;

      const newLayers = [...prevLayers];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newLayers.length) return newLayers;

      [newLayers[index], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[index]];
      return newLayers;
    });
  };
  const handleSaveAsImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const scale = 2; // Increase for higher resolution
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;
  
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
  
      tempCtx.scale(scale, scale);
      tempCtx.drawImage(canvas, 0, 0);
  
      const imageURL = tempCanvas.toDataURL('image/png');
  
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = 'starry-sky.png';
      link.click();
    }
  };
  return (
    <div className='container-content'>
      {!shouldShowFullscreen && (
        <div className='toolbar'>
          <div className='flex-container mb-4 mt-1 w-100'>
            <h2 className='mb-4'>{t.title}</h2>
            <div className='d-flex flex-column justify-content-center align-items-center nav-menu'>
              <LanguageDropdown />
              <ThemeBtn />
            </div>
          </div>

          <button onClick={addRectangle} className='button'>
            {t.addZone}
          </button>
          <button className='button' onClick={addComet}>
            {t.addComet}
          </button>
          <button className='button' onClick={generateComet}>
            {t.generateComet}
          </button>
          <button className='button' onClick={deleteCometPoints}>
            {t.deleteCometPoints}
          </button>
          <button className='button' onClick={generateStars}>
            {t.generateStars}
          </button>

          <FileInput onChange={handleImageUpload} />

          <button className='button' onClick={() => setShouldShowDotifyMenu(true)}>
            {t.dotifyMenu}
          </button>
          {shouldShowDotifyMenu && (
            <DotifyTool
              setAddedImages={setAddedImages}
              onClose={() => setShouldShowDotifyMenu(false)}
            />
          )}
          <button className='button' onClick={handleSaveAsImage}>
            {t.saveAsImage || 'Save as Image'}
          </button>

            
            <button className='button' onClick={() => setShowStarMenu(!showStarMenu)}>
              {showStarMenu ? t.hideStarsMenu : t.starsMenu}
            </button>

            {showStarMenu && (
              <div className='star-generator'>
                <label htmlFor='star-count'>{t.numberOfStars}</label>
                <input
                  type='number'
                  id='star-count'
                  value={starCountInput}
                  onChange={(e) => setStarCountInput(Number(e.target.value))}
                  min='1'
                  max='100' // Set a reasonable max limit
                />
                <label htmlFor='star-diameter'>{t.diameter}:</label>
                <select
                  id='star-diameter'
                  value={selectedDiameter}
                  onChange={(e) => setSelectedDiameter(Number(e.target.value))}
                >
                  {dotSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <label htmlFor='star-color'>{t.color}:</label>
                <select
                  id='star-color'
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}>
                  {dotColors.map((color) => (
                    <option key={color} value={color} style={{ backgroundColor: color }}>
                      {/* Don't fucking touch it. if it works, it should */}
                      
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </option>
                  ))}
                </select>

                <button className='button' onClick={generateStars}>
                  {t.generate}
                </button> 
              </div>
              )}
            {/* {!showStarMenu && (
              <button className='button' onClick={generateStars}>
                {t.generateStars}
              </button>
            )} */}
          
          <div className='mt-4'>
            <label htmlFor='distance-slider' className='label'>
              {t.distanceBetweenDots}
            </label>
            <input
              type='range'
              min='1'
              max='10'
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className='slider'
            />

            <span className='slider-value'>
              {distance} {t.pixels}
            </span>
          </div>
          <div>
            <label htmlFor='random-offset-slider' className='label'>
              {t.randomOffset}
            </label>
            <input
              type='range'
              min='0'
              max='20'
              value={randomOffset}
              onChange={(e) => setRandomOffset(Number(e.target.value))}
              className='slider'
            />
            <br />
            <span className='slider-value'>
              {randomOffset} {t.pixels}
            </span>
          </div>
          <div className='mt-4'>
            <h2>{t.layers}</h2>
            {layers.map((layer) => (
              <div key={layer.id}>
                <button onClick={() => toggleLayerVisibility(layer.id)}>
                  {layer.visible ? '👁️' : '🚫'} {layer.id}
                </button>
                <button onClick={() => moveLayer(layer.id, 'up')}>{t.moveUp}</button>
                <button onClick={() => moveLayer(layer.id, 'down')}>{t.moveDown}</button>
              </div>
            ))}
          </div>
        </div>
        
      )}

      <Canvas
        ref={canvasRef}
        setAddedImages={setAddedImages}
        addedImages={addedImages}
        stars={stars}
        setStars={setStars}
        toggleLayerVisibility={toggleLayerVisibility}
        cometPaths={cometPaths}
        rectangles={rectangles}
        points={points}
        setPoints={setPoints}
        image={image}
        setRectangles={setRectangles}
        showControlPoints={showControlPoints}
        layers={layers}
        handleSaveAsImage={handleSaveAsImage}
        shouldShowFullscreen={shouldShowFullscreen}
        setShouldShowFullscreen={setShouldShowFullscreen}
      />
    </div>
  );};


export default Comet;
