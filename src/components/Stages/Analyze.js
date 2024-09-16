import React, { useState, useEffect, useRef } from 'react';
import { fromArrayBuffer } from 'geotiff';
import Konva from 'konva';
import { Stage, Layer, Image } from 'react-konva';

import { post } from '../../utils/requests';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useFilesContext, setFiles, setResizedFiles, setProcessedFiles, setResizedProcessedFiles } from '../../contexts/FilesContext';
import { useImageContext, setImageURI, setImageDimensions } from '../../contexts/ImageContext';

const Analyze = ({ currentProject, changeProjectProperty }) => {
  const { projects : {}, dispatch : projectDispatch } = useProjectContext()
  const { files : { processedFiles, resizedProcessedFiles }, dispatch : filesDispatch } = useFilesContext()
  const { image : { imageURI, imageDimensions }, dispatch : imageDispatch } = useImageContext()

  const defaultImageFilters = {
    contrast : 0,
    brightness : 0,
    hue : 0,
    saturation : 0,
    luminance : 0,
    red : 150,
    green : 150,
    blue : 150
  }

  const defaultFiltersMinMax = {
    contrast : [0, 100],
    brightness : [0, 1],
    hue : [0, 259],
    saturation : [-2, 10],
    luminance : [-2, 2]
  }

  const defaultImageBands = [0, 2, 4];

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [ availableHeight, setAvailableHeight ] = useState(0);
  const [ availableWidth, setAvailableWidth ] = useState(0)
  const [ currentFile, setCurrentFile ] = useState(false);
  const [ currentImage, setCurrentImage ] = useState(false);
  const [ currentImageCanvas, setCurrentImageCanvas ] = useState(false);
  const [ totalImageBands, setTotalImageBands ] = useState(0);
  const [ currentImageBands, setCurrentImageBands ] = useState()
  const [ selectedImageBands, setSelectedImageBands ] = useState(defaultImageBands)

  const [ stageScale, setStageScale ] = useState(1);
  const [ stageX, setStageX ] = useState(0);
  const [ stageY, setStageY ] = useState(0);

  const [ imageFilters, setImageFilters ] = useState(defaultImageFilters);

  useEffect(() => {
    findAvailableSpace()
    window.addEventListener('resize', findAvailableSpace);
  }, [])

  useEffect(() => {
    const pca = resizedProcessedFiles.find(file => file.name.indexOf('_PCA.tif') > -1);
    if(pca && !currentFile) {
      setCurrentFile(pca)
    } else {
      setCurrentFile(false)
    }
  }, [resizedProcessedFiles])

  useEffect(() => {
    if(currentFile) {
      createTiffImage();
    }
  }, [currentFile])

  useEffect(() => {
    if(currentImage) {
      createCanvasImage()
    }
  }, [currentImage])

  useEffect(() => {
    if(imageFilters && imageRef.current) {
      adjustImage()
    }
  }, [imageFilters])

  const adjustImage = () => {
    imageRef.current.contrast(imageFilters.contrast);
    imageRef.current.brightness(imageFilters.brightness);
    imageRef.current.hue(imageFilters.hue);
    imageRef.current.saturation(imageFilters.saturation);
    imageRef.current.luminance(imageFilters.luminance);
    imageRef.current.cache();
  }

  const saveImage = async () => {
    await canvasRef.current.toImage({ callback : (resp) => {
      let uri = resp.src;
      imageDispatch(setImageURI(uri));
    }, mimeType : "image/png" });
  }

  const createTiffImage = async() => {
    const fileBuffer = window.fs.readFileSync(currentFile.path);
    const tiff = await fromArrayBuffer(bufferToArrayBuffer(fileBuffer));
    const image = await tiff.getImage();
    setCurrentImage(image);
  }

  const createCanvasImage = async() => {
    const [r, g, b] = await Promise.all([
      currentImage.readRasters({ samples: [selectedImageBands[0]] }), // Band 1
      currentImage.readRasters({ samples: [selectedImageBands[1]] }), // Band 2
      currentImage.readRasters({ samples: [selectedImageBands[2]] })  // Band 3
    ]);
    const width = currentImage.getWidth();
    const height = currentImage.getHeight();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    imageDispatch(setImageDimensions([width, height]));

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data; // This will hold RGBA values

    // Loop through each pixel and set the RGB values
    for (let i = 0; i < width * height; i++) {
        const pixelIndex = i * 4;
        data[pixelIndex] = r[0][i];     // Red
        data[pixelIndex + 1] = g[0][i]; // Green
        data[pixelIndex + 2] = b[0][i]; // Blue
        data[pixelIndex + 3] = 255;  // Alpha (fully opaque)
    }

    // Draw the ImageData onto the canvas
    ctx.putImageData(imageData, 0, 0);
    setCurrentImageCanvas(canvas);
    setCurrentImageBands(selectedImageBands);
    setTotalImageBands(currentImage.fileDirectory.SamplesPerPixel);
    adjustImage()
    saveImage()
  }

  const findAvailableSpace = () => {
    let totalWindowWidth = window.innerWidth;
    let totalWindowHeight = window.innerHeight ;
    let projectsWidth = document.getElementById('projects').offsetWidth;
    let titlebarHeight = document.getElementById('titlebar').offsetHeight;
    let workspaceHeaderHeight = document.getElementById('workspace-header').offsetHeight;
    let margins = 20;
    setAvailableWidth(totalWindowWidth - projectsWidth - (margins * 2));
    setAvailableHeight(totalWindowHeight - titlebarHeight - workspaceHeaderHeight - (margins * 2));
  }

  const onCanvasWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 0.95;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale)
    setStageX(-(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale)
    setStageY(-(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale)
  }

  const bufferToArrayBuffer = (buffer) => {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }

  const adjustImageFilter = (prop, val) => {
    let newImageFilters = JSON.parse(JSON.stringify(imageFilters));
    if(prop === 'default') {
      for(let property in defaultImageFilters) {
        newImageFilters[property] = defaultImageFilters[property];
      }
    } else {
      newImageFilters[prop] = parseFloat(val);
    }
    setImageFilters(newImageFilters)
  }

  const selectBand = (index, band) => {
    if(band) {
      let numberBand = parseInt(band);
      if(selectedImageBands[index] !== numberBand) {
        let newSelectedImageBands = JSON.parse(JSON.stringify(selectedImageBands));
        newSelectedImageBands[index] = numberBand;
        setSelectedImageBands(newSelectedImageBands);
      }
    }
  }

  const downloadImage = async () => {
    // if(canvasRef.current) {
    //   await canvasRef.current.toImage({ callback : (resp) => {
    //     let uri = resp.src;
    //     var link = document.getElementById('download-link');
    //     link.setAttribute('download', `${currentProject.name}-${selectedImageBands.join('_')}.png`);
    //     link.setAttribute('href', uri);
    //     link.click();
    //   }, mimeType : "image/png", width : imageWidth, height : imageHeight });
    // }
  }

  const randomizeLayers = () => {
    let randomImageBands = [
      Math.floor( Math.random() * totalImageBands ),
      Math.floor( Math.random() * totalImageBands ),
      Math.floor( Math.random() * totalImageBands )
    ]
    setSelectedImageBands(randomImageBands)
  }

  const randomizeFilters = () => {
    let newRandomFilters = {};
    for(let prop in defaultFiltersMinMax) {
      newRandomFilters[prop] = Math.round((Math.random() * (defaultFiltersMinMax[prop][1] - defaultFiltersMinMax[prop][0]) + defaultFiltersMinMax[prop][0]) * 100)/100
    }
    setImageFilters(newRandomFilters)
  }

  let width = 0;
  let height = 0
  if(currentImageCanvas) {
    // If there is less space available for the height, then it's the smaller side
    let imageRatio = imageDimensions[0] / imageDimensions[1];
    if((availableWidth/availableHeight) > imageRatio) {
      height = availableHeight;
      width = availableHeight * (imageDimensions[0] / imageDimensions[1])
    } else {
      width = availableWidth;
      height = availableWidth * (imageDimensions[1] / imageDimensions[0])
    }
  }

  return (
    <div>
      <div className="canvas-container" ref={containerRef}>
        <div className="floating-controls">
          {totalImageBands > 0 ?
            <x-card>
              <div className="control">
                <div className="randomizer" onClick={() => randomizeLayers()}><x-icon size="small" href="#shuffle"></x-icon></div>
                <x-label>Red Layer</x-label>
                <x-select size="small" value={selectedImageBands[0]} onClick={(e) => selectBand(0, e.target.value)}>
                  <x-menu>
                    {[...Array(totalImageBands)].map((n, i) => {
                      return (
                        <x-menuitem key={`band-${i}`} value={i} toggled={selectedImageBands[0] === i ? true : null}>
                          <x-label>Band {i + 1}</x-label>
                        </x-menuitem>
                      )
                    })}
                  </x-menu>
                </x-select>
              </div>
              <div className="control">
                <x-label>Green Layer</x-label>
                <x-select size="small" value={selectedImageBands[1]} onClick={(e) => selectBand(1, e.target.value)}>
                  <x-menu>
                    {[...Array(totalImageBands)].map((n, i) => {
                      return (
                        <x-menuitem key={`band-${i}`} value={i} toggled={selectedImageBands[1] === i ? true : null}>
                          <x-label>Band {i + 1}</x-label>
                        </x-menuitem>
                      )
                    })}
                  </x-menu>
                </x-select>
              </div>
              <div className="control">
                <x-label>Blue Layer</x-label>
                <x-select size="small" value={selectedImageBands[2]} onClick={(e) => selectBand(2, e.target.value)}>
                  <x-menu>
                    {[...Array(totalImageBands)].map((n, i) => {
                      return (
                        <x-menuitem key={`band-${i}`} value={i} toggled={selectedImageBands[2] === i ? true : null}>
                          <x-label>Band {i + 1}</x-label>
                        </x-menuitem>
                      )
                    })}
                  </x-menu>
                </x-select>
              </div>
              {selectedImageBands.join() !== currentImageBands.join() ?
                <div className="control">
                  <x-button condensed="true" size="small" onClick={() => createCanvasImage()}><x-label>Regenerate Image</x-label></x-button>
                </div>
              : false}
              <hr />
              <div className="control">
                <div className="randomizer" onClick={() => randomizeFilters()}><x-icon size="small" href="#shuffle"></x-icon></div>
                <x-label>Contrast ({imageFilters.contrast})</x-label>
                <input type="range" value={imageFilters.contrast} min={defaultFiltersMinMax.contrast[0]} max={defaultFiltersMinMax.contrast[1]} onMouseUp={() => saveImage()} onChange={(e) => adjustImageFilter('contrast', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Brightness ({imageFilters.brightness})</x-label>
                <input type="range" value={imageFilters.brightness} min={defaultFiltersMinMax.brightness[0]} max={defaultFiltersMinMax.brightness[1]} onMouseUp={() => saveImage()} step="0.01" onChange={(e) => adjustImageFilter('brightness', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Hue ({imageFilters.hue})</x-label>
                <input type="range" value={imageFilters.hue} min={defaultFiltersMinMax.hue[0]} max={defaultFiltersMinMax.hue[1]} step="1" onMouseUp={() => saveImage()} onChange={(e) => adjustImageFilter('hue', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Saturation ({imageFilters.saturation})</x-label>
                <input type="range" value={imageFilters.saturation} min={defaultFiltersMinMax.saturation[0]} max={defaultFiltersMinMax.saturation[1]} step="0.5" onMouseUp={() => saveImage()} onChange={(e) => adjustImageFilter('saturation', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Luminance ({imageFilters.luminance})</x-label>
                <input type="range" value={imageFilters.luminance} min={defaultFiltersMinMax.luminance[0]} max={defaultFiltersMinMax.luminance[1]} step="0.1" onMouseUp={() => saveImage()} onChange={(e) => adjustImageFilter('luminance', e.target.value)} />
              </div>
              <div className="control">
                <x-button onClick={() => adjustImageFilter('default')}><x-label>Reset</x-label></x-button>
              </div>
              <hr />
              <x-button onClick={() => downloadImage()}><x-label>Save Image</x-label></x-button>
              <a id="download-link"></a>
            </x-card>
          : false }
        </div>
        {currentImageCanvas ?
          <Stage
            ref={canvasRef}
            width={width}
            height={height}
            onWheel={onCanvasWheel}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stageX}
            y={stageY}>
            <Layer>
              <Image
                ref={imageRef}
                draggable={true}
                width={width}
                height={height}
                image={currentImageCanvas}
                filters={[Konva.Filters.Contrast, Konva.Filters.Brighten, Konva.Filters.HSL]}
              />
            </Layer>
          </Stage>
        : false}
      </div>
    </div>
  )
}
// <div className="control">
//   <x-label>Red (Layer one)</x-label>
//   <input type="range" value={imageFilters.red} min="0" max="256" step="1" onChange={(e) => adjustImageFilter('red', e.target.value)} />
// </div>
// <div className="control">
//   <x-label>Green (Layer two)</x-label>
//   <input type="range" value={imageFilters.green} min="0" max="256" step="0.5" onChange={(e) => adjustImageFilter('green', e.target.value)} />
// </div>
// <div className="control">
//   <x-label>Blue (Layer three)</x-label>
//   <input type="range" value={imageFilters.blue} min="0" max="256" step="0.1" onChange={(e) => adjustImageFilter('blue', e.target.value)} />
// </div>

export default Analyze;
