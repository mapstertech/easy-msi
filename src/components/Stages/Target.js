import React, { useState, useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image, Rect } from 'react-konva';

import { findAvailableSpace } from '../../utils/utils'
import { post } from '../../utils/requests';
import { useCanvasContext, setCanvasDimensions } from '../../contexts/CanvasContext';
import { useImageContext } from '../../contexts/ImageContext';

const Target = ({ currentProject, changeProjectProperty }) => {

  const { canvas : { canvasDimensions }, dispatch : canvasDispatch } = useCanvasContext()
  const { image : { imageURI, imageDimensions }, dispatch : imageDispatch } = useImageContext()

  const [ imageElement, setImageElement ] = useState(false);
  const [ annotationBeingDrawn, setAnnotationBeingDrawn ] = useState(false);
  const [ annotation, setAnnotation ] = useState(false);

  useEffect(() => {
    let dimensions = findAvailableSpace(imageDimensions)
    canvasDispatch(setCanvasDimensions(dimensions))
    window.addEventListener('resize', () => {
      let dimensions = findAvailableSpace(imageDimensions)
      canvasDispatch(setCanvasDimensions(dimensions))
    });
  }, [])

  useEffect(() => {
    if(imageURI) {
      let image = document.createElement('img')
      image.src = imageURI;
      setImageElement(image)
    }
  }, [imageURI])

  const handleMouseDown = event => {
    const { x, y } = event.target.getStage().getPointerPosition();
    setAnnotation({ x, y, width: 0, height: 0, key: "0" });
    setAnnotationBeingDrawn(true)
  };

  const handleMouseUp = event => {
    if (annotationBeingDrawn !== false) {
      const sx = annotation.x;
      const sy = annotation.y;
      const { x, y } = event.target.getStage().getPointerPosition();
      const annotationToAdd = {
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy
      };
      setAnnotation(annotationToAdd);
      setAnnotationBeingDrawn(false)
    }
  };

  const handleMouseMove = event => {
    if (annotationBeingDrawn !== false) {
      const sx = annotation.x;
      const sy = annotation.y;
      const { x, y } = event.target.getStage().getPointerPosition();
      setAnnotation({
        x: sx,
        y: sy,
        width: x - sx,
        height: y - sy,
        key: "0"
      });
    }
  };

  return (
    <div>
      <x-accordion expanded="true">
        <header>
          <x-label>1. Select Area of Interest</x-label>
        </header>

        <main>
          <x-label>To target an area, draw an area of interest on the image below.</x-label>
          <div className="image-drawing">
            {imageElement ?
              <Stage
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                width={canvasDimensions[0]}
                height={canvasDimensions[1]}>
                <Layer>
                  <Image
                    image={imageElement}
                  />
                </Layer>
                <Layer>
                  {annotation ?
                    <Rect
                      x={annotation.x}
                      y={annotation.y}
                      width={annotation.width}
                      height={annotation.height}
                      fill="transparent"
                      stroke="white"
                    />
                  : false}
                </Layer>
              </Stage>
            : false}
          </div>
        </main>
      </x-accordion>
      <x-accordion>
        <header>
          <x-label>2. Generate Targeted Analysis Files</x-label>
        </header>
      </x-accordion>
    </div>
  )
}

export default Target;
