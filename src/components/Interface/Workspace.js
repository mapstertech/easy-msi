import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';

import trash from '../../img/trash-icon.png';
import { useProjectContext, editProject, removeProject } from '../../contexts/ProjectContext';

const Workspace = () => {
  const { projects : { allProjects, currentProjectIndex }, dispatch } = useProjectContext()
  const [ currentProject, setCurrentProject ] = useState(false)

  useEffect(() => {
    if(currentProjectIndex !== false) {
      let newCurrentProject = allProjects[currentProjectIndex];
      if(newCurrentProject) {
        setCurrentProject(newCurrentProject);
      }
    } else {
      setCurrentProject(false)
    }
  }, [allProjects, currentProjectIndex])

  const changeProjectName = (projectName) => {
    let editedProject = JSON.parse(JSON.stringify(currentProject));
    editedProject.name = projectName;
    dispatch(editProject(editedProject))
  }

  const deleteProject = () => {
    if(window.confirm("Are you sure you want to delete this project? This can't be reversed.")) {
      dispatch(removeProject())
    }
  }

  return (
    <div className="workspace">
      {currentProject ?
        <div>
          <Row>
            <Col xs={5}>
              <Form.Control size="lg" type="text" placeholder="Project Name" value={currentProject.name} onChange={(e) => changeProjectName(e.target.value)} />
            </Col>
            <Col xs={7} className="d-flex justify-content-end align-items-center">
              <Button size="sm" variant="danger" onClick={() => deleteProject()}><img className="icon" src={trash} /></Button>
            </Col>
          </Row>
        </div>
      :
        <div className="d-flex align-items-center justify-content-center vh-100">
          <p>Select a folder with your TIFs in it to get started.</p>
        </div>
      }

    </div>
  )
}

export default Workspace;
