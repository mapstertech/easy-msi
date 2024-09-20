import React, { useState, useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image, Rect } from 'react-konva';

import { findAvailableSpace } from '../../utils/utils'
import { post } from '../../utils/requests';
import { useCanvasContext, setCanvasDimensions } from '../../contexts/CanvasContext';
import { useFilesContext } from '../../contexts/FilesContext';
import { useImageContext } from '../../contexts/ImageContext';

const Target = ({ currentProject, changeProjectProperty }) => {

  const { canvas : { canvasDimensions }, dispatch : canvasDispatch } = useCanvasContext()
  const { image : { imageURI, imageDimensions }, dispatch : imageDispatch } = useImageContext()
  const { files : { selectedFile } } = useFilesContext()

  const [ imageElement, setImageElement ] = useState(false);
  const [ annotationBeingDrawn, setAnnotationBeingDrawn ] = useState(false);
  const [ annotation, setAnnotation ] = useState(false);
  const [ enterName, setEnterName ] = useState(false);
  const [ name, setName ] = useState("");
  const [ analysisComplete, setAnalysisComplete ] = useState(false)
  const [ loading, setLoading ] = useState(false);

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

  const analyzeSection = () => {
    if(annotation) {
      const percentageBounds = [
        [
          annotation.x/canvasDimensions[0],
          annotation.y/canvasDimensions[1]
        ],
        [
          (annotation.x + annotation.width)/canvasDimensions[0],
          (annotation.y + annotation.height)/canvasDimensions[1]
        ]
      ];
      post(JSON.stringify({ path : currentProject.path, cropDimensions : percentageBounds, name : name }), 'targeted-folder-crop', (resp) => {
        console.log(resp);
        setAnalysisComplete(true)
      })
    }
  }

  const handleMouseDown = event => {
    const { x, y } = event.target.getStage().getPointerPosition();
    setAnnotation({ x, y, width: 0, height: 0, key: "0" });
    setAnnotationBeingDrawn(true)
    setEnterName(false)
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
      {enterName ?
        <div className="fake-prompt">
          <x-input type="text" onInput={(e) => setName(e.target.value)}>
            <x-label>Enter File Name</x-label>
          </x-input>
          <x-buttons style={{marginTop: 10}}>
            <x-button size="small" onClick={() => { analyzeSection(); setEnterName(false); }}><x-label>Analyze</x-label></x-button>
            <x-button size="small" onClick={() => setEnterName(false)}><x-label>Cancel</x-label></x-button>
          </x-buttons>
        </div>
      : false}
      {selectedFile.indexOf('targeted') === -1 && selectedFile.indexOf('_cropped_') === -1 ?
        <>
          <x-box style={{width: canvasDimensions[0], height: 20}}>
            <x-label>To target an area for high-quality analysis, click and drag on the image below.</x-label>
            {annotation && !annotationBeingDrawn ?
              <div style={{flex: 1}}>
                <x-buttons style={{float: 'right'}}>
                  <x-button size="small" onClick={() => setEnterName(true)}><x-label>Analyze</x-label></x-button>
                  <x-button size="small" onClick={() => setAnnotation(false)}><x-label>Re-Draw</x-label></x-button>
                </x-buttons>
              </div>
            : false}
          </x-box>
          <div className="loading-bar">
            {loading ? <x-progressbar /> : false }
          </div>
          {!analysisComplete ?

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
                      >
                      </Rect>
                    : false}
                  </Layer>
                </Stage>
              : false}
            </div>
          :
            <x-button size="small" onClick={() => changeProjectProperty('stage', 2)}><x-label>Back to Process to select new image</x-label></x-button>
          }
        </>
      :
        <>
          <x-label>It looks like you're using a targeted/cropped file already. You have to go back and select a different file from the Process tab in order to do targeting.</x-label>
          <x-button size="small" style={{marginTop: 10}} onClick={() => changeProjectProperty('stage', 2)}><x-label>Back to Process</x-label></x-button>
        </>
      }
    </div>
  )
}

export default Target;
