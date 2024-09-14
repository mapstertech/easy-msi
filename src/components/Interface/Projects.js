import React, { useState } from 'react';

import { useProjectContext, addProject, setCurrentProjectIndex } from '../../contexts/ProjectContext';

const Projects = () => {

  let projectTemplate = {
    name : "New Project",
    path : "",
    resized : false,
    stage : 1
  }

  const { projects : { allProjects, currentProjectIndex }, dispatch } = useProjectContext()

  const getDirectory = () => {
    window.dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      if(result.filePaths.length > 0) {
        let newProject = JSON.parse(JSON.stringify(projectTemplate))
        newProject.path = result.filePaths[0];
        dispatch(addProject(newProject))
      }
    });
  }

  return (
    <div>
      <section>
        <h3><x-message>Projects</x-message></h3>
        {allProjects.map((project, index) => {
          return (
            <x-button skin="nav" key={`project-${index}`} toggled={currentProjectIndex === index ? true : null} onClick={() => dispatch(setCurrentProjectIndex(index))}>
              <x-label>{project.name}</x-label>
            </x-button>
          )
        })}
      </section>
      <hr />
      <section>
        <x-button className="add-project" onClick={() => getDirectory()}><x-label>Add a new project</x-label></x-button>
      </section>
    </div>
  )
}

export default Projects;
