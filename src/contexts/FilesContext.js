import React, { createContext, useReducer, useContext } from "react";

export const FilesContext = createContext();

const initialState = {
  files : [],
  processedFiles : [],
  resizedFiles : [],
  resizedProcessedFiles : []
}

// Actions
export const SET_FILES = 'SET_FILES'
export const SET_PROCESSED_FILES = 'SET_PROCESSED_FILES'
export const SET_RESIZED_FILES = 'SET_RESIZED_FILES'
export const SET_RESIZED_PROCESSED_FILES = 'SET_RESIZED_PROCESSED_FILES'

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
