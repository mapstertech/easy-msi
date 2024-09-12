import React, { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { useProjectContext, addProject, setCurrentProjectIndex } from '../../contexts/ProjectContext';

const Projects = () => {

  let projectTemplate = {
    name : "New Project",
    path : "",
    stage : 0
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
      <div className="d-grid gap-2">
        <ButtonGroup vertical>
          {allProjects.map((project, index) => {
            return (
              <Button key={`project-${index}`} variant="dark" active={currentProjectIndex === index ? true : false} onClick={() => dispatch(setCurrentProjectIndex(index))}>{project.name}</Button>
            )
          })}
        </ButtonGroup>
      </div>
      <Button className="add-project" variant="success" size="sm" onClick={() => getDirectory()}>Add a new project</Button>
    </div>
  )
}

export default Projects;
