import React, { createContext, useReducer, useContext } from "react";

export const FilesContext = createContext();

const initialState = {
  files : [],
  processedFiles : [],
  resizedFiles : [],
  resizedProcessedFiles : [],
  selectedFile : false,
  loadedFile : false
}

// Actions
export const SET_FILES = 'SET_FILES'
export const SET_PROCESSED_FILES = 'SET_PROCESSED_FILES'
export const SET_RESIZED_FILES = 'SET_RESIZED_FILES'
export const SET_RESIZED_PROCESSED_FILES = 'SET_RESIZED_PROCESSED_FILES'
export const SET_SELECTED_FILE = 'SET_SELECTED_FILE'
export const SET_LOADED_FILE = 'SET_LOADED_FILE'

// Creators
export function setFiles(files) {
  return { type : SET_FILES, files }
}
export function setProcessedFiles(processedFiles) {
  return { type : SET_PROCESSED_FILES, processedFiles }
}
export function setResizedFiles(resizedFiles) {
  return { type : SET_RESIZED_FILES, resizedFiles }
}
export function setResizedProcessedFiles(resizedProcessedFiles) {
  return { type : SET_RESIZED_PROCESSED_FILES, resizedProcessedFiles }
}
export function setSelectedFile(selectedFile) {
  return { type : SET_SELECTED_FILE, selectedFile }
}
export function setLoadedFile(loadedFile) {
  return { type : SET_LOADED_FILE, loadedFile }
}


// Reducer
export function filesReducer(state, action) {
  switch (action.type) {
    case SET_FILES:
      return {
        ...state,
        files : action.files,
      };
    case SET_PROCESSED_FILES:
      return {
        ...state,
        processedFiles : action.processedFiles,
      };
    case SET_RESIZED_FILES:
      return {
        ...state,
        resizedFiles : action.resizedFiles,
      };
    case SET_RESIZED_PROCESSED_FILES:
      return {
        ...state,
        resizedProcessedFiles : action.resizedProcessedFiles,
      };
    case SET_SELECTED_FILE:
      localStorage.setItem('selectedFile', action.selectedFile)
      return {
        ...state,
        selectedFile : action.selectedFile,
      };
    case SET_LOADED_FILE:
      return {
        ...state,
        loadedFile : action.loadedFile,
      };
    default:
      return state;
  }
}

function FilesProvider(props) {
  const [files, dispatch] = useReducer(filesReducer, initialState);

  const filesData = { files, dispatch };

  return <FilesContext.Provider value={filesData} {...props} />;
}

function useFilesContext() {
  return useContext(FilesContext);
}

export { FilesProvider, useFilesContext };
