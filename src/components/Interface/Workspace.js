import React, { useState, useEffect } from 'react';

import Resize from '../Stages/Resize'
import Process from '../Stages/Process'

import { post } from '../../utils/requests';
import trash from '../../img/trash-icon.png';
import { useProjectContext, editProject, removeProject } from '../../contexts/ProjectContext';
import { useFilesContext, setFiles, setResizedFiles, setProcessedFiles, setResizedProcessedFiles } from '../../contexts/FilesContext';

const Workspace = () => {
  const { projects : { allProjects, currentProjectIndex }, dispatch : projectDispatch } = useProjectContext()
  const { files : {}, dispatch : filesDispatch } = useFilesContext()
  const [ editing, setEditing ] = useState(false);
  const [ currentProject, setCurrentProject ] = useState(false)

  useEffect(() => {
    if(currentProjectIndex !== false && allProjects[currentProjectIndex]) {
      setCurrentProject(allProjects[currentProjectIndex])
    }
  }, [allProjects, currentProjectIndex])

  useEffect(() => {
    if(currentProject) {
      post(JSON.stringify({ path : currentProject.path }), 'get-project-info', (resp) => {
        console.log(resp)
        filesDispatch(setFiles(resp.files));
        filesDispatch(setProcessedFiles(resp.processed_files));
        filesDispatch(setResizedFiles(resp.resized_files));
        filesDispatch(setResizedProcessedFiles(resp.resized_processed_files));
      })
    }
  }, [currentProject])

  const changeProjectProperty = (prop, value) => {
    let editedProject = JSON.parse(JSON.stringify(currentProject));
    editedProject[prop] = value;
    projectDispatch(editProject(editedProject))
  }

  const deleteProject = () => {
    if(window.confirm("Are you sure you want to delete this project? This can't be reversed.")) {
      projectDispatch(removeProject())
    }
  }

  return (
    <div>
      {currentProject ?
        <div>
          <x-box>
            <section style={{width: '50%'}}>
              <h2>{currentProject.name}</h2>
            </section>
            <div style={{width: '50%'}}>
              <x-button style={{float: 'right'}} onClick={() => deleteProject()}><x-icon href="#delete"></x-icon></x-button>
              {editing ?
                <x-box style={{float: 'right', marginRight: '5px'}}>
                  <x-input style={{marginRight: '5px'}} type="text" onInput={(e) => changeProjectProperty('name', e.target.value)}>
                    <x-label>{currentProject.name}</x-label>
                  </x-input>
                  <x-button style={{float: 'right', marginRight: '5px'}} onClick={() => setEditing(false)}><x-icon href="#check"></x-icon></x-button>
                </x-box>
              :
                <x-button style={{float: 'right', marginRight: '5px'}} onClick={() => setEditing(true)}><x-icon href="#edit"></x-icon></x-button>
              }
            </div>
          </x-box>
          <div>
            <x-tabs>
              <x-tab selected={currentProject.stage === 1 ? true : null} onClick={() => changeProjectProperty('stage', 1)}><x-label>1. Resize</x-label></x-tab>
              <x-tab selected={currentProject.stage === 2 ? true : null} onClick={() => changeProjectProperty('stage', 2)}><x-label>2. Process</x-label></x-tab>
              <x-tab selected={currentProject.stage === 3 ? true : null} onClick={() => changeProjectProperty('stage', 3)}><x-label>3. Analyze</x-label></x-tab>
            </x-tabs>
          </div>
          <div style={{marginTop: '20px'}}>
            {currentProject.stage === 1 ?
              <Resize currentProject={currentProject} changeProjectProperty={changeProjectProperty} />
            : false }
            {currentProject.stage === 2 ?
              <Process currentProject={currentProject} changeProjectProperty={changeProjectProperty} />
            : false }
          </div>
        </div>
      :
        <x-box class="no-project-selected">
          <x-label>Select a folder with your TIFs in it to get started.</x-label>
        </x-box>
      }

    </div>
  )
}

export default Workspace;
