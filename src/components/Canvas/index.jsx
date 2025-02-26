import React,  { useState, useEffect,  useCallback } from 'react';

const starRange = 50;
const minDistance = 10;
const maxStars = 50000;
const dotColors = ['#ff0000', '#0000ff', '#00ff00', '#000000'];
const dotSizes = [1.88, 2.83, 3.77, 5.66];

export const Canvas = React.forwardRef(
  (
    {
  stars,
  setStars,
  toggleLayerVisibility,
  cometPaths,
  rectangles,
  points,
  setPoints,
  image,
  setRectangles,
  showControlPoints,
  layers,
  shouldShowFullscreen,
  addedImages,
  setAddedImages,
},
 ref
) => {
  const canvasRef = ref;

  const [isFullscreen] = useState(false);
  const [draggingPointIndex, setDraggingPointIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [drawingStars, setDrawingStars] = useState(false);
  // console.log(addedImages);
  // Canvas drawing functions
  const drawComet = (ctx, pathData) => {
    const { path, color } = pathData;
    path.forEach((point) => {
      const size = Math.random() * (2 - 1) + 1;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    });
  };

  const drawRectangles = useCallback(
    (ctx) => {
      rectangles.forEach((rectangle) => {
        ctx.beginPath();
        ctx.moveTo(rectangle[0].x, rectangle[0].y);
        rectangle.forEach((point, index) => {
          if (index < rectangle.length - 1) {
            ctx.lineTo(rectangle[index + 1].x, rectangle[index + 1].y);
          }
        });
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'green';
        ctx.stroke();
      });
    },
    [rectangles]
  );

  const drawCurve = useCallback(
    (ctx, points) => {
      if (points.length >= 3 && showControlPoints) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
        points.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'red';
          ctx.fill();
          ctx.stroke();
        });
      }
    },
    [showControlPoints]
  );

  const draw = useCallback(
    (ctx) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Drawing image layer only when it's set to visible
    const imageLayer = layers.find(layer => layer.id === 'image');
    if (image && imageLayer?.visible) {
      ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }

      // Отрисовка других слоев (прямоугольников, звезд, кривых и т.д.)
      layers.forEach((layer) => {
        if (layer.visible) {
          switch (layer.type) {
            case 'shape':
              rectangles.forEach((points) => {
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach((point) => {
                  ctx.lineTo(point.x, point.y);
                });
                ctx.closePath();
                ctx.stroke();

                ctx.fillStyle = 'red';
                points.forEach((point) => {
                  ctx.beginPath();
                  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                  ctx.fill();
                });
              });
              break;
            case 'comet':
              cometPaths.forEach((pathData) => {
                drawComet(ctx, pathData);
              });
              break;
            case 'color':
              stars.forEach((star) => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
                ctx.fillStyle = star.color;
                ctx.fill();
                ctx.closePath();
              });
              break;
            default:
              break;
          }
        }
      });

      drawCurve(ctx, points); // Рисуем кривую
    },
    [image, layers, rectangles, cometPaths, stars, points, drawCurve]
  );

  const drawStar = (mouseX, mouseY) => {
    let x, y;
    const color = dotColors[Math.floor(Math.random() * dotColors.length)];
    const size = dotSizes[Math.floor(Math.random() * dotSizes.length)];

    do {
      x = mouseX + (Math.random() - 0.5) * starRange;
      y = mouseY + (Math.random() - 0.5) * starRange;
    } while (
      stars.some(
        (star) => Math.sqrt(Math.pow(star.x - x, 2) + Math.pow(star.y - y, 2)) < minDistance
      )
    );

    const newStar = { x, y, size, color };
    setStars((prevStars) => {
      const newStars = [...prevStars, newStar];
      return newStars.length > maxStars ? newStars.slice(newStars.length - maxStars) : newStars;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedPointIndex(null);
    setDraggingIndex(null);
    setDraggingPointIndex(null);
    setDrawingStars(false);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = 0; i < rectangles.length; i++) {
      const points = rectangles[i];
      const index = points.findIndex((point) => Math.hypot(point.x - mouseX, point.y - mouseY) < 5);
      if (index !== -1) {
        setDraggingIndex(i);
        setDraggingPointIndex(index);
        return;
      }
    }

    const pointIndex = points.findIndex((point) => {
      return Math.abs(point.x - mouseX) < 5 && Math.abs(point.y - mouseY) < 5;
    });

    if (pointIndex !== -1) {
      setIsDragging(true);
      setDraggedPointIndex(pointIndex);
    }

    if (drawingStars) {
      for (let i = 0; i < rectangles.length; i++) {
        const points = rectangles[i];
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();

        if (ctx.isPointInPath(mouseX, mouseY)) {
          drawStar(mouseX, mouseY);
          break;
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedPointIndex !== null) {
      const { offsetX, offsetY } = e.nativeEvent;
      const newPoints = [...points];
      newPoints[draggedPointIndex] = { x: offsetX, y: offsetY };
      setPoints(newPoints);
    }

    if (draggingIndex === null || draggingPointIndex === null) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (drawingStars) {
        for (let i = 0; i < rectangles.length; i++) {
          const points = rectangles[i];
          const ctx = canvasRef.current.getContext('2d');
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.forEach((point) => ctx.lineTo(point.x, point.y));
          ctx.closePath();

          if (ctx.isPointInPath(mouseX, mouseY)) {
            drawStar(mouseX, mouseY);
            break;
          }
        }
      }
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newRectangles = [...rectangles];
      newRectangles[draggingIndex][draggingPointIndex] = { x: mouseX, y: mouseY };
      setRectangles(newRectangles);
    }
  };

  const handleCanvasClick = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    const clickedStar = stars.find(
      (star) =>
        Math.abs(star.x - offsetX) < star.size / 2 && Math.abs(star.y - offsetY) < star.size / 2
    );

    if (clickedStar) {
      toggleLayerVisibility('stars');
      return;
    }

    const clickedComet = cometPaths.find((path) =>
      path.some((point) => Math.abs(point.x - offsetX) < 2 && Math.abs(point.y - offsetY) < 2)
    );

    if (clickedComet) {
      toggleLayerVisibility('comets');
    }
  };
  // Fullscreen logic
  const toggleFullscreen = () => {
    const canvas = canvasRef.current;
    if (!isFullscreen) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
      } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
      } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx);
    drawRectangles(ctx);
    drawCurve(ctx, points);
  }, [points, draw, drawCurve, drawRectangles, image, shouldShowFullscreen]);

  const [draggingImageIndex, setDraggingImageIndex] = useState(null); // Текущий индекс перетаскиваемого изображения
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // Смещение от позиции курсора

  const handleImageMouseDown = (e, index) => {
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggingImageIndex(index);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleImageMouseMove = useCallback(
    (e) => {
      if (draggingImageIndex === null) return;

      const canvas = canvasRef.current;
      const canvasContainer = canvas.parentNode;
      const containerRect = canvasContainer.getBoundingClientRect();

      // Координаты мыши относительно контейнера canvas
      const mouseX = e.clientX - containerRect.left - dragOffset.x;
      const mouseY = e.clientY - containerRect.top - dragOffset.y;

      // Ограничение по границам canvas
      const constrainedX = Math.max(0, Math.min(canvas.width - 160, mouseX)); // Ширина элемента 200px
      const constrainedY = Math.max(0, Math.min(canvas.height - 160, mouseY)); // Высота элемента 200px

      setAddedImages((prevImages) => {
        const updatedImages = [...prevImages];
        updatedImages[draggingImageIndex] = {
          ...updatedImages[draggingImageIndex],
          x: constrainedX,
          y: constrainedY,
        };
        return updatedImages;
      });
    },
    [draggingImageIndex, dragOffset, setAddedImages]
  );

  const handleImageMouseUp = () => {
    setDraggingImageIndex(null);
  };

  useEffect(() => {
    const handleMouseMove = (e) => handleImageMouseMove(e);
    const handleMouseUp = () => handleImageMouseUp();

    if (draggingImageIndex !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingImageIndex, handleImageMouseMove]);

  return (
    <div className='canvas-container'>
      <canvas
        className={`canvas ${shouldShowFullscreen ? 'full' : 'short'}`}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        width={shouldShowFullscreen ? window.innerWidth - 4 : 1400}
        height={shouldShowFullscreen ? window.innerHeight - 4 : 900}
      />
      {addedImages.map((image, index) => (
        <img
          key={index}
          src={image.src}
          alt={`Added element ${index}`}
          draggable={false}
          onMouseDown={(e) => handleImageMouseDown(e, index)}
          style={{
            position: 'absolute',
            left: image.x,
            top: image.y,
            width: '200px',
            height: '200px',
            cursor: 'grab',
            zIndex: 2,
          }}
        />
      ))}
      <img
        onClick={toggleFullscreen}
        className='fullscreen-icon'
        src='/expand.png'
        alt='icon'
      />
    </div>
  );
  }
);
Canvas.displayName = 'Canvas';
