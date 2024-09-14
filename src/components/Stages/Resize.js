import React, { useState, useEffect } from 'react';

import { post } from '../../utils/requests';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useFilesContext, setFiles, setResizedFiles } from '../../contexts/FilesContext';

const Resize = ({ currentProject, changeProjectProperty }) => {
  const { projects : {}, dispatch : projectDispatch } = useProjectContext()
  const { files : { files, resizedFiles }, dispatch : filesDispatch } = useFilesContext()

  const resize = () => {
    post(JSON.stringify({ path : currentProject.path }), 'resize-images', (resp) => {
      console.log(resp)
      filesDispatch(setResizedFiles(resp.resized_files));
    })
  }

  return (
    <div>
      <x-label>Resizing your files will make them process much faster and use less computing power, while keeping pretty good resolution.</x-label>
      <h3>Raw Files</h3>
      <x-accordion>
        <header>
          <x-label>{currentProject.path} ({files.length} files, {parseFloat(files.reduce((a, b) => a + b.size, 0)/1000000).toFixed(2)} MB)</x-label>
        </header>
        <main>
          <ul>
            {files.map(file => {
              return <li><small>{file.name} ({parseFloat(file.size / 1000000).toFixed(2)} MB)</small></li>
            })}
          </ul>
        </main>
      </x-accordion>
      {files.length > 0 && resizedFiles.length === 0 ?
        <x-button onClick={() => resize()}><x-label>Resize</x-label></x-button>
      : false }
      <div>
        <h3>Resized Files</h3>
        <x-accordion>
          <header>
            <x-label>{currentProject.path}\resized ({resizedFiles.length} files, {parseFloat(resizedFiles.reduce((a, b) => a + b.size, 0)/1000000).toFixed(2)} MB)</x-label>
          </header>
          <main>
            <ul>
              {resizedFiles.map(file => {
                return <li><small>{file.name} ({parseFloat(file.size / 1000000).toFixed(2)} MB)</small></li>
              })}
            </ul>
          </main>
        </x-accordion>
      </div>
      {files.length > 0 && resizedFiles.length > 0 ?
        <x-button onClick={() => changeProjectProperty('stage', 2)}><x-label>Next Step</x-label></x-button>
      : false }
    </div>
  )
}

export default Resize;
