import React, { Fragment, useEffect } from 'react';

import Titlebar from 'components/Titlebar/Titlebar';
import Projects from 'components/Interface/Projects';
import Workspace from 'components/Interface/Workspace';

import { useProjectContext, setProjects, setCurrentProjectIndex } from '../contexts/ProjectContext';

import 'scss/App.scss';
import 'scss/Titlebar.scss';
import 'scss/TitlebarButtons.scss';
import 'scss/Projects.scss';
import 'scss/Workspace.scss';

function App() {

  const { dispatch } = useProjectContext()

  useEffect(() => {
    if(localStorage.getItem('projects')) {
      let projects = localStorage.getItem('projects')
      dispatch(setProjects(JSON.parse(projects)));
    }
    if(localStorage.getItem('projectIndex')) {
      let projectIndex = localStorage.getItem('projectIndex')
      if(projectIndex && projectIndex !== "false") {
        dispatch(setCurrentProjectIndex(parseInt(projectIndex)));
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
