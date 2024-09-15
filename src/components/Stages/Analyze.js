import React, { useState, useEffect, useRef } from 'react';
import { fromArrayBuffer } from 'geotiff';
import Konva from 'konva';
import { Stage, Layer, Image } from 'react-konva';

import { post } from '../../utils/requests';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useFilesContext, setFiles, setResizedFiles, setProcessedFiles, setResizedProcessedFiles } from '../../contexts/FilesContext';

const Analyze = ({ currentProject, changeProjectProperty }) => {
  const { projects : {}, dispatch : projectDispatch } = useProjectContext()
  const { files : { processedFiles, resizedProcessedFiles }, dispatch : filesDispatch } = useFilesContext()

  const defaultImageSettings = {
    contrast : 0,
    brightness : 0,
    hue : 0,
    saturation : 0,
    luminance : 0,
    red : 150,
    green : 150,
    blue : 150
  }

  const defaultImageBands = [0, 2, 4];

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [ availableHeight, setAvailableHeight ] = useState(0);
  const [ availableWidth, setAvailableWidth ] = useState(0)
  const [ currentFile, setCurrentFile ] = useState(false);
  const [ currentImageCanvas, setCurrentImageCanvas ] = useState(false);
  const [ totalImageBands, setTotalImageBands ] = useState(0);
  const [ currentImageBands, setCurrentImageBands ] = useState()
  const [ selectedImageBands, setSelectedImageBands ] = useState(defaultImageBands)

  const [ imageWidth, setImageWidth ] = useState(0)
  const [ imageHeight, setImageHeight ] = useState(0)
  const [ stageScale, setStageScale ] = useState(1);
  const [ stageX, setStageX ] = useState(0);
  const [ stageY, setStageY ] = useState(0);

  const [ imageSettings, setImageSettings ] = useState(defaultImageSettings);

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
      createTiffImage()
    }
  }, [currentFile])

  useEffect(() => {
    if(imageSettings && imageRef.current) {
      adjustImage()
    }
  }, [imageSettings])

  const adjustImage = () => {
    imageRef.current.contrast(imageSettings.contrast);
    imageRef.current.brightness(imageSettings.brightness);
    imageRef.current.hue(imageSettings.hue);
    imageRef.current.saturation(imageSettings.saturation);
    imageRef.current.luminance(imageSettings.luminance);
    imageRef.current.cache();
  }

  const createTiffImage = async() => {
    const fileBuffer = window.fs.readFileSync(currentFile.path);
    const tiff = await fromArrayBuffer(bufferToArrayBuffer(fileBuffer));
    const image = await tiff.getImage();
    const [r, g, b] = await Promise.all([
      image.readRasters({ samples: [selectedImageBands[0]] }), // Band 1
      image.readRasters({ samples: [selectedImageBands[1]] }), // Band 2
      image.readRasters({ samples: [selectedImageBands[2]] })  // Band 3
    ]);
    const width = image.getWidth();
    const height = image.getHeight();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    setImageWidth(width);
    setImageHeight(height);

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
    setTotalImageBands(image.fileDirectory.SamplesPerPixel);
    adjustImage()
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

  const adjustImageSetting = (prop, val) => {
    let newImageSettings = JSON.parse(JSON.stringify(imageSettings));
    if(prop === 'default') {
      for(let property in defaultImageSettings) {
        newImageSettings[property] = defaultImageSettings[property];
      }
    } else {
      newImageSettings[prop] = parseFloat(val);
    }
    setImageSettings(newImageSettings)
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

  const saveImage = async () => {
    if(canvasRef.current) {
      await canvasRef.current.toImage({ callback : (resp) => {
        let uri = resp.src;
        var link = document.getElementById('download-link');
        link.setAttribute('download', `${currentProject.name}-${selectedImageBands.join('_')}.png`);
        link.setAttribute('href', uri);
        link.click();
      }, mimeType : "image/png", width : imageWidth, height : imageHeight });
    }
  }

  let width = 0;
  let height = 0
  if(currentImageCanvas) {
    // If there is less space available for the height, then it's the smaller side
    let imageRatio = imageWidth / imageHeight;
    if((availableWidth/availableHeight) > imageRatio) {
      height = availableHeight;
      width = availableHeight * (imageWidth / imageHeight)
    } else {
      width = availableWidth;
      height = availableWidth * (imageHeight / imageWidth)
    }
  }

  return (
    <div>
      <div className="canvas-container" ref={containerRef}>
        <div className="floating-controls">
          {totalImageBands > 0 ?
            <x-card>
              <div className="control">
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
                  <x-button condensed="true" size="small" onClick={() => createTiffImage()}><x-label>Regenerate Image</x-label></x-button>
                </div>
              : false}
              <hr />
              <div className="control">
                <x-label>Contrast ({imageSettings.contrast})</x-label>
                <input type="range" value={imageSettings.contrast} min="0" max="100" onChange={(e) => adjustImageSetting('contrast', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Brightness ({imageSettings.brightness})</x-label>
                <input type="range" value={imageSettings.brightness} min="0" max="1" step="0.01" onChange={(e) => adjustImageSetting('brightness', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Hue ({imageSettings.hue})</x-label>
                <input type="range" value={imageSettings.hue} min="0" max="259" step="1" onChange={(e) => adjustImageSetting('hue', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Saturation ({imageSettings.saturation})</x-label>
                <input type="range" value={imageSettings.saturation} min="-2" max="10" step="0.5" onChange={(e) => adjustImageSetting('saturation', e.target.value)} />
              </div>
              <div className="control">
                <x-label>Luminance ({imageSettings.luminance})</x-label>
                <input type="range" value={imageSettings.luminance} min="-2" max="2" step="0.1" onChange={(e) => adjustImageSetting('luminance', e.target.value)} />
              </div>
              <div className="control">
                <x-button onClick={() => adjustImageSetting('default')}><x-label>Reset</x-label></x-button>
              </div>
              <hr />
              <x-button onClick={() => saveImage()}><x-label>Save Image</x-label></x-button>
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
//   <input type="range" value={imageSettings.red} min="0" max="256" step="1" onChange={(e) => adjustImageSetting('red', e.target.value)} />
// </div>
// <div className="control">
//   <x-label>Green (Layer two)</x-label>
//   <input type="range" value={imageSettings.green} min="0" max="256" step="0.5" onChange={(e) => adjustImageSetting('green', e.target.value)} />
// </div>
// <div className="control">
//   <x-label>Blue (Layer three)</x-label>
//   <input type="range" value={imageSettings.blue} min="0" max="256" step="0.1" onChange={(e) => adjustImageSetting('blue', e.target.value)} />
// </div>

export default Analyze;
