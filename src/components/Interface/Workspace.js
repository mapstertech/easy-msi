import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, ListGroup, Nav, Placeholder } from 'react-bootstrap';

import { post } from '../../utils/requests';
import trash from '../../img/trash-icon.png';
import { useProjectContext, editProject, removeProject } from '../../contexts/ProjectContext';

const Workspace = () => {
  const { projects : { allProjects, currentProjectIndex }, dispatch } = useProjectContext()
  const [ currentProject, setCurrentProject ] = useState(false)
  const [ files, setFiles ] = useState([])
  const [ stage, setStage ] = useState(1);

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

  useEffect(() => {
    if(currentProject) {
      post(JSON.stringify({
        path : currentProject.path
      }), 'get-files', (resp) => {
        console.log(resp)
        setFiles(resp);
      }, (err) => {
        console.log(err)
      })
    }
  }, [currentProject])

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
    <div>
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
          <Row>
            <Col>
              <p><small>{currentProject.path} ({files.length} files)</small></p>
            </Col>
          </Row>
          <hr className="header-separator" />
          <Row>
            <Col xs={2}></Col>
            <Col xs={8}>
              <Nav fill variant="tabs" defaultActiveKey="/home" className="button-tabs">
                <Nav.Item className="d-grid gap-2">
                  <Button variant="outline-success" active={stage === 1} block onClick={() => setStage(1)}>1. Resize</Button>
                </Nav.Item>
                <Nav.Item className="d-grid gap-2">
                  <Button variant="outline-success" active={stage === 2} block onClick={() => setStage(2)}>2. Process</Button>
                </Nav.Item>
                <Nav.Item className="d-grid gap-2">
                  <Button variant="outline-success" active={stage === 3} block onClick={() => setStage(3)}>3. Review</Button>
                </Nav.Item>
              </Nav>
            </Col>
            <Col xs={2}></Col>
          </Row>
          <Row style={{marginTop: '20px'}}>
            <Col xs={5}>
              <h3>Raw Files</h3>
              <ul>
                {files.map(file => {
                  return <li><small>{file.name} ({parseFloat(file.size / 1000000).toFixed(2)} MB)</small></li>
                })}
              </ul>
            </Col>
            <Col xs={2} className="d-flex justify-content-middle align-items-center">
              <button>Convert</button>
            </Col>
            <Col xs={5}>
              <h3 style={{textAlign: "right"}}>Resized Files</h3>
              <Placeholder as="p" animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
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
