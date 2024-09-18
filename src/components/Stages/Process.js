import React, { useState, useEffect } from 'react';

import { post } from '../../utils/requests';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useFilesContext, setFiles, setSelectedFile, setResizedFiles, setProcessedFiles, setResizedProcessedFiles } from '../../contexts/FilesContext';

const Process = ({ currentProject, changeProjectProperty }) => {
  const { projects : {}, dispatch : projectDispatch } = useProjectContext()
  const { files : { files, processedFiles, resizedFiles, resizedProcessedFiles, selectedFile }, dispatch : filesDispatch } = useFilesContext()
  const [ selectedFolder, setSelectedFolder ] = useState('resized');

  const process = () => {
    let folder = 'resized';
    if(selectedFolder === 'raw') {
      if(window.confirm("Are you sure you want to process the raw files? This may be slow and require heavy computing power.")) {
        folder = "";
      }
    }
    post(JSON.stringify({ path : currentProject.path, folder : folder }), 'process-folder', (resp) => {
      if(resp.folder === 'resized') {
        filesDispatch(setResizedProcessedFiles(resp.processed_files));
      } else {
        filesDispatch(setProcessedFiles(resp.processed_files));
      }
    })
  }

  return (
    <div>
      <x-label>In this step, create composite images (PCA, ICA, etc) from your raw or resized TIFs.</x-label>
      <h3>Create Composite Images</h3>
      <div style={{margin: "10px"}}>
        <x-radios>
          <x-radio toggled={selectedFolder === 'resized' ? true : null} onClick={() => setSelectedFolder('resized')}>
            <x-label>Use resized files</x-label>
          </x-radio>
          <x-radio toggled={selectedFolder === 'raw' ? true : null} onClick={() => setSelectedFolder('raw')}>
            <x-label>Use original files</x-label>
          </x-radio>
        </x-radios>
      </div>
      <x-button onClick={() => process()}><x-label>Create Composite Images</x-label></x-button>
      {resizedProcessedFiles.length > 0 ?
        <div>
          <hr style={{marginTop: '10px'}}/>
          <h3>Processed Resized Files</h3>
          <x-label>Select a file to analyze for the next step.</x-label>
          <x-accordion expanded="true">
            <header>
              <x-label>{currentProject.path}\resized\processed ({resizedProcessedFiles.length} files, {parseFloat(resizedProcessedFiles.reduce((a, b) => a + b.size, 0)/1000000).toFixed(2)} MB)</x-label>
            </header>
            <main>
              <x-radios>
                {resizedProcessedFiles.map((file, i) => {
                  return <x-radio key={`resized-${i}`} toggled={selectedFile === file.path ? true : null} onClick={() => filesDispatch(setSelectedFile(file.path))}><x-label>{file.name} ({parseFloat(file.size / 1000000).toFixed(2)} MB)</x-label></x-radio>
                })}
              </x-radios>
            </main>
          </x-accordion>
        </div>
      : false}
      {processedFiles.length > 0 ?
        <div>
          <h3>Processed Raw Files</h3>
          <x-accordion>
            <header>
              <x-label>{currentProject.path}\processed ({processedFiles.length} files, {parseFloat(processedFiles.reduce((a, b) => a + b.size, 0)/1000000).toFixed(2)} MB)</x-label>
            </header>
            <main>
              <ul>
                {processedFiles.map(file => {
                  return <li><small>{file.name} ({parseFloat(file.size / 1000000).toFixed(2)} MB)</small></li>
                })}
              </ul>
            </main>
          </x-accordion>
        </div>
      : false}
      {selectedFile ?
        <x-button onClick={() => changeProjectProperty('stage', 3)}><x-label>Next Step</x-label></x-button>
      : false }
    </div>
  )
}

export default Process;
