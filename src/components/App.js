import React, { Fragment, useEffect } from 'react';

import Titlebar from 'components/Titlebar/Titlebar';
import Projects from 'components/Interface/Projects';
import Workspace from 'components/Interface/Workspace';

import { useProjectContext, setProjects, setCurrentProjectIndex } from '../contexts/ProjectContext';
import { useImageContext, setImageURI, setImageDimensions } from '../contexts/ImageContext';

import 'scss/App.scss';
import 'scss/Titlebar.scss';
import 'scss/TitlebarButtons.scss';
import 'scss/Projects.scss';
import 'scss/Workspace.scss';

function App() {

  const { dispatch : projectDispatch } = useProjectContext()
  const { dispatch : imageDispatch } = useImageContext()

  useEffect(() => {
    if(localStorage.getItem('projects')) {
      let projects = localStorage.getItem('projects')
      projectDispatch(setProjects(JSON.parse(projects)));
    }
    if(localStorage.getItem('projectIndex')) {
      let projectIndex = localStorage.getItem('projectIndex')
      if(projectIndex && projectIndex !== "false") {
        projectDispatch(setCurrentProjectIndex(parseInt(projectIndex)));
      }
    }
    if(localStorage.getItem('imageURI')) {
      let imageURI = localStorage.getItem('imageURI')
      if(imageURI && imageURI !== "false") {
        imageDispatch(setImageURI(imageURI));
      }
    }
    if(localStorage.getItem('imageDimensions')) {
      let imageDimensions = localStorage.getItem('imageDimensions')
      if(imageDimensions && imageDimensions !== "false") {
        imageDispatch(setImageDimensions(JSON.parse(imageDimensions)));
      }
    }
  }, []);

  return (
    <Fragment>
      <Titlebar />
      <x-box id="app" class="app">
        <div id="projects" className="projects">
          <Projects />
        </div>
        <div className="workspace">
          <Workspace />
        </div>
      </x-box>
    </Fragment>
  );
}

export default App;
