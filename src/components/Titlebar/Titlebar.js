import {
  CloseButton,
  ContractButton,
  MaximizeButton,
  MinimizeButton
} from 'components/Titlebar/TitlebarButtons';
import React, { useState } from 'react';

import { app } from 'utils/services';

import favicon from '../../img/favicon.png';

const Titlebar = () => {

  const [ maximized, setMaximized ] = useState(false);

  const handleMaximizeToggle = () => {
    !maximized ? app.maximize() : app.unmaximize();
    setMaximized(!maximized);
  };

  return (
    <section className="titlebar">
      <div>
        <img src={ favicon } alt="favicon" />
        <span id="electron-window-title-text">{ document.title }</span>
      </div>

      <div id="electron-window-title-buttons">
        <MinimizeButton onClick={ app.minimize } />
        {
          maximized
            ? <ContractButton onClick={ handleMaximizeToggle } />
            : <MaximizeButton onClick={ handleMaximizeToggle } />
        }
        <CloseButton onClick={ app.quit } />
      </div>
    </section>
  );
};

export default Titlebar;
