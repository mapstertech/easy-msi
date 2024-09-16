import 'index.scss';

import * as serviceWorker from 'serviceWorker';

import App from 'components/App';
import React from 'react';
import ReactDOM from 'react-dom';

import { ProjectProvider } from './contexts/ProjectContext';
import { FilesProvider } from './contexts/FilesContext';
import { ImageProvider } from './contexts/ImageContext';

ReactDOM.render(
  <React.StrictMode>
    <ProjectProvider>
      <FilesProvider>
        <ImageProvider>
          <App />
        </ImageProvider>
      </FilesProvider>
    </ProjectProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
