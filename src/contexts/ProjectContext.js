import React, { createContext, useReducer, useContext } from "react";

export const ProjectContext = createContext();

const initialState = {
  allProjects : [],
  currentProjectIndex : false
}

// Actions
export const SET_PROJECTS = 'SET_PROJECTS'
export const ADD_PROJECT = 'ADD_PROJECT'
export const EDIT_PROJECT = 'EDIT_PROJECT'
export const REMOVE_PROJECT = 'REMOVE_PROJECT'
export const SET_CURRENT_PROJECT_INDEX = 'SET_CURRENT_PROJECT_INDEX'

// Creators
export function setProjects(allProjects) {
  return { type : SET_PROJECTS, allProjects }
}
export function addProject(newProject) {
  return { type : ADD_PROJECT, newProject }
}
export function editProject(editedProject) {
  return { type : EDIT_PROJECT, editedProject }
}
export function removeProject() {
  return { type : REMOVE_PROJECT }
}
export function setCurrentProjectIndex(projectIndex) {
  return { type : SET_CURRENT_PROJECT_INDEX, projectIndex }
}

// Reducer
export function projectReducer(state, action) {
  switch (action.type) {
    case SET_PROJECTS:
      return {
        ...state,
        allProjects : action.allProjects,
      };
    case ADD_PROJECT:
      let newAllProjects = JSON.parse(JSON.stringify(state.allProjects));
      newAllProjects.push(action.newProject);
      localStorage.setItem('projects', JSON.stringify(newAllProjects))
      return {
        ...state,
        allProjects : newAllProjects,
      };
    case EDIT_PROJECT:
      let editedProjects = JSON.parse(JSON.stringify(state.allProjects));
      editedProjects[state.currentProjectIndex] = action.editedProject;
      localStorage.setItem('projects', JSON.stringify(editedProjects))
      return {
        ...state,
        allProjects : editedProjects,
      };
    case REMOVE_PROJECT:
      let removedProjects = JSON.parse(JSON.stringify(state.allProjects));
      removedProjects.splice(state.currentProjectIndex, 1);
      localStorage.setItem('projects', JSON.stringify(removedProjects))
      localStorage.setItem('projectIndex', false)
      return {
        ...state,
        currentProjectIndex : false,
        allProjects : removedProjects,
      };
    case SET_CURRENT_PROJECT_INDEX:
      localStorage.setItem('projectIndex', action.projectIndex)
      return {
        ...state,
        currentProjectIndex : action.projectIndex
      };
    default:
      return state;
  }
}

function ProjectProvider(props) {
  const [projects, dispatch] = useReducer(projectReducer, initialState);

  const projectData = { projects, dispatch };

  return <ProjectContext.Provider value={projectData} {...props} />;
}

function useProjectContext() {
  return useContext(ProjectContext);
}

export { ProjectProvider, useProjectContext };
