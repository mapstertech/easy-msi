import React, { Fragment, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

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
    // setTimeout(() => get(
    //   'example', // Route
    //   (response) => alert(response), // Response callback
    //   (error) => console.error(error) // Error callback
    // ), 3000);
  }, []);

  return (
    <Fragment>
      <Titlebar />
      <Container fluid className="app">
        <Row>
          <Col className="projects" xs={3}>
            <Projects />
          </Col>
          <Col className="workspace" xs={9}>
            <Workspace />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

export default App;
