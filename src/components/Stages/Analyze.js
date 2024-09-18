import React, { useState, useEffect, useRef } from 'react';
import { fromArrayBuffer } from 'geotiff';
import Konva from 'konva';
import { Stage, Layer, Image } from 'react-konva';

import { post } from '../../utils/requests';
import { findAvailableSpace } from '../../utils/utils'
import { defaultImageFilters, defaultFiltersMinMax } from '../../utils/constants'
import { useProjectContext } from '../../contexts/ProjectContext';
import { useFilesContext, setLoadedFile } from '../../contexts/FilesContext';
import { useCanvasContext, setCanvas, setCanvasImage, setCanvasScale, setCanvasDimensions, setCanvasPosition, setFilters, setTotalBands, setSelectedBands } from '../../contexts/CanvasContext';
import { useImageContext, setImageURI, setImageDimensions } from '../../contexts/ImageContext';

const Analyze = ({ currentProject, changeProjectProperty }) => {
  const { projects : {}, dispatch : projectDispatch } = useProjectContext()
  const { files : { selectedFile, loadedFile }, dispatch : filesDispatch } = useFilesContext()
  const { canvas : { canvas, canvasImage, totalBands, selectedBands, canvasScale, canvasDimensions, canvasPosition, filters }, dispatch : canvasDispatch } = useCanvasContext()
  const { image : { imageURI, imageDimensions }, dispatch : imageDispatch } = useImageContext()

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [ currentImageBands, setCurrentImageBands ] = useState([])

  useEffect(() => {
    let dimensions = findAvailableSpace(imageDimensions)
    canvasDispatch(setCanvasDimensions(dimensions))
    window.addEventListener('resize', () => {
      let dimensions = findAvailableSpace(imageDimensions)
      canvasDispatch(setCanvasDimensions(dimensions))
    });
  }, [])

  useEffect(() => {
    if(canvasScale === 1 && imageDimensions && canvasDimensions) {
      if(canvasDimensions[0] !== 0) {
        let scale = canvasDimensions[0]/imageDimensions[0];
        canvasDispatch(setCanvasScale(scale))
      }
    }
  }, [imageDimensions])

  useEffect(() => {
    if(selectedFile && (!loadedFile || loadedFile !== selectedFile)) {
      createTiffImage();
      filesDispatch(setLoadedFile(selectedFile))
    }
  }, [selectedFile])

  useEffect(() => {
    if(filters && imageRef.current) {
      adjustImage()
    }
  }, [filters])

  const adjustImage = () => {
    imageRef.current.contrast(filters.contrast);
    imageRef.current.brightness(filters.brightness);
    imageRef.current.hue(filters.hue);
    imageRef.current.saturation(filters.saturation);
    imageRef.current.luminance(filters.luminance);
    imageRef.current.cache();
  }

  const saveImage = async () => {
    await canvasRef.current.toImage({ callback : (resp) => {
      let uri = resp.src;
      imageDispatch(setImageURI(uri));
    }, mimeType : "image/png" });
  }

  const createTiffImage = async() => {
    const fileBuffer = window.fs.readFileSync(selectedFile);
    const tiff = await fromArrayBuffer(bufferToArrayBuffer(fileBuffer));
    const image = await tiff.getImage();
    createCanvasImage(image)
    canvasDispatch(setCanvasImage(image))
  }

  const createCanvasImage = async(image) => {
    const [r, g, b] = await Promise.all([
      image.readRasters({ samples: image.fileDirectory.SampleFormat[selectedBands[0]] ? [selectedBands[0]] : [] }),
      image.readRasters({ samples: image.fileDirectory.SampleFormat[selectedBands[1]] ? [selectedBands[1]] : [] }),
      image.readRasters({ samples: image.fileDirectory.SampleFormat[selectedBands[2]] ? [selectedBands[2]] : [] })
    ]);
    const width = image.getWidth();
    const height = image.getHeight();

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
    canvasDispatch(setCanvas(canvas));
    canvasDispatch(setTotalBands(image.fileDirectory.SamplesPerPixel))
    setCurrentImageBands(selectedBands);
    adjustImage()
    saveImage()
  }

  const onCanvasWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 0.90;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    canvasDispatch(setCanvasScale(newScale))
    canvasDispatch(setCanvasPosition([
      -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    ]))
  }

  const bufferToArrayBuffer = (buffer) => {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }

  const adjustImageFilter = (prop, val) => {
    let newImageFilters = JSON.parse(JSON.stringify(filters));
    if(prop === 'default') {
      for(let property in defaultImageFilters) {
        newImageFilters[property] = defaultImageFilters[property];
      }
    } else {
      newImageFilters[prop] = parseFloat(val);
    }
    canvasDispatch(setFilters(newImageFilters))
  }

  const selectBand = (index, band) => {
    if(band) {
      let numberBand = parseInt(band);
      if(selectedBands[index] !== numberBand) {
        let newSelectedImageBands = JSON.parse(JSON.stringify(selectedBands));
        newSelectedImageBands[index] = numberBand;
        canvasDispatch(setSelectedBands(newSelectedImageBands));
      }
    }
  }

  const downloadImage = async (image) => {
    if(image) {
      const [r, g, b] = await Promise.all([
        image.readRasters({ samples: image.fileDirectory.SampleFormat[selectedBands[0]] ? [selectedBands[0]] : [] }),
        image.readRasters({ samples: image.fileDirectory.SampleFormat[selectedBands[1]] ? [selectedBands[1]] : [] }),
        image.readRasters({ samples: image.fileDirectory.SampleFormat[selectedBands[2]] ? [selectedBands[2]] : [] })
      ]);
      const width = image.getWidth();
      const height = image.getHeight();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

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

      let dataURL = canvas.toDataURL("image/png");

      var link = document.getElementById('download-link');
      link.setAttribute('download', `${currentProject.name}-${selectedBands.join('_')}.png`);
      link.setAttribute('href', dataURL);
      link.click();
    }
  }

  const randomizeLayers = () => {
    let randomImageBands = [
      Math.floor( Math.random() * totalBands ),
      Math.floor( Math.random() * totalBands ),
      Math.floor( Math.random() * totalBands )
    ]
    canvasDispatch(setSelectedBands(randomImageBands))
  }

  const randomizeFilters = () => {
    let newRandomFilters = {};
    for(let prop in defaultFiltersMinMax) {
      newRandomFilters[prop] = Math.round((Math.random() * (defaultFiltersMinMax[prop][1] - defaultFiltersMinMax[prop][0]) + defaultFiltersMinMax[prop][0]) * 100)/100
    }
    canvasDispatch(setFilters(newRandomFilters))
  }

  return (
    <div>
      <div className="canvas-container" ref={containerRef}>
        <div className="floating-controls">
          {totalBands > 0 ?
            <x-card>
              <div className="control">
                <div className="randomizer" onClick={() => randomizeLayers()}><x-icon size="small" href="#shuffle"></x-icon></div>
                <x-label>Red Layer</x-label>
                <x-select size="small" value={selectedBands[0]} onClick={(e) => selectBand(0, e.target.value)}>
                  <x-menu>
                    {[...Array(totalBands)].map((n, i) => {
                      return (
                        <x-menuitem key={`band-${i}`} value={i} toggled={selectedBands[0] === i ? true : null}>
                          <x-label>Band {i + 1}</x-label>
                        </x-menuitem>
                      )
                    })}
                  </x-menu>
                </x-select>
              </div>
              <div className="control">
                <x-label>Green Layer</x-label>
                <x-select size="small" value={selectedBands[1]} onClick={(e) => selectBand(1, e.target.value)}>
                  <x-menu>
                    {[...Array(totalBands)].map((n, i) => {
                      return (
                        <x-menuitem key={`band-${i}`} value={i} toggled={selectedBands[1] === i ? true : null}>
                          <x-label>Band {i + 1}</x-label>
                        </x-menuitem>
                      )
                    })}
                  </x-menu>
                </x-select>
              </div>
              <div className="control">
                <x-label>Blue Layer</x-label>
                <x-select size="small" value={selectedBands[2]} onClick={(e) => selectBand(2, e.target.value)}>
                  <x-menu>
                    {[...Array(totalBands)].map((n, i) => {
                      return (
                        <x-menuitem key={`band-${i}`} value={i} toggled={selectedBands[2] === i ? true : null}>
                          <x-label>Band {i + 1}</x-label>
                        </x-menuitem>
                      )
                    })}
                  </x-menu>
                </x-select>
              </div>
              {selectedBands.join() !== currentImageBands.join() && canvasImage ?
                <div className="control">
                  <x-button condensed="true" size="small" onClick={() => createCanvasImage(canvasImage)}><x-label>Regenerate Image</x-label></x-button>
                </div>
              : false}
              <hr />
              <div className="control">
                <div className="randomizer" onClick={() => randomizeFilters()}><x-icon size="small" href="#shuffle"></x-icon></div>
                <x-label>Contrast ({filters.contrast})</x-label>
                <input type="range" value={filters.contrast} min={defaultFiltersMinMax.contrast[0]} max={defaultFiltersMinMax.contrast[1]} onMouseUp={() => saveImage()} onChange={(e) => adjustImageFilter('contrast', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Brightness ({filters.brightness})</x-label>
                <input type="range" value={filters.brightness} min={defaultFiltersMinMax.brightness[0]} max={defaultFiltersMinMax.brightness[1]} onMouseUp={() => saveImage()} step="0.01" onChange={(e) => adjustImageFilter('brightness', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Hue ({filters.hue})</x-label>
                <input type="range" value={filters.hue} min={defaultFiltersMinMax.hue[0]} max={defaultFiltersMinMax.hue[1]} step="1" onMouseUp={() => saveImage()} onChange={(e) => adjustImageFilter('hue', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Saturation ({filters.saturation})</x-label>
                <input type="range" value={filters.saturation} min={defaultFiltersMinMax.saturation[0]} max={defaultFiltersMinMax.saturation[1]} step="0.5" onMouseUp={() => saveImage()} onChange={(e) => adjustImageFilter('saturation', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Luminance ({filters.luminance})</x-label>
                <input type="range" value={filters.luminance} min={defaultFiltersMinMax.luminance[0]} max={defaultFiltersMinMax.luminance[1]} step="0.1" onMouseUp={() => saveImage()} onChange={(e) => adjustImageFilter('luminance', e.target.value)} />
              </div>
              <div className="control">
                <x-button onClick={() => adjustImageFilter('default')}><x-label>Reset</x-label></x-button>
              </div>
              <hr />
              <x-button onClick={() => downloadImage(canvasImage)}><x-label>Save Image</x-label></x-button>
              <a id="download-link"></a>
            </x-card>
          : false }
        </div>
        {canvas ?
          <Stage
            ref={canvasRef}
            width={canvasDimensions[0]}
            height={canvasDimensions[1]}
            onWheel={onCanvasWheel}
            scaleX={canvasScale}
            scaleY={canvasScale}
            x={canvasPosition[0]}
            y={canvasPosition[1]}>
            <Layer>
              <Image
                ref={imageRef}
                draggable={true}
                image={canvas}
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
//   <input type="range" value={filters.red} min="0" max="256" step="1" onChange={(e) => adjustImageFilter('red', e.target.value)} />
// </div>
// <div className="control">
//   <x-label>Green (Layer two)</x-label>
//   <input type="range" value={filters.green} min="0" max="256" step="0.5" onChange={(e) => adjustImageFilter('green', e.target.value)} />
// </div>
// <div className="control">
//   <x-label>Blue (Layer three)</x-label>
//   <input type="range" value={filters.blue} min="0" max="256" step="0.1" onChange={(e) => adjustImageFilter('blue', e.target.value)} />
// </div>

export default Analyze;
