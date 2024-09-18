import React, { createContext, useReducer, useContext } from "react";
import { defaultImageFilters, defaultImageBands } from '../utils/constants'

export const CanvasContext = createContext();

const initialState = {
  canvas : false,
  canvasImage : false,
  totalBands : 0,
  selectedBands : defaultImageBands,
  canvasDimensions : [0, 0],
  canvasScale : 1,
  canvasPosition : [0, 0],
  filters : defaultImageFilters
}

// Actions
export const SET_CANVAS = 'SET_CANVAS'
export const SET_CANVAS_IMAGE = 'SET_CANVAS_IMAGE'
export const SET_TOTAL_BANDS = 'SET_TOTAL_BANDS'
export const SET_SELECTED_BANDS = 'SET_SELECTED_BANDS'
export const SET_CANVAS_DIMENSIONS = 'SET_CANVAS_DIMENSIONS'
export const SET_CANVAS_SCALE = 'SET_CANVAS_SCALE'
export const SET_CANVAS_POSITION = 'SET_CANVAS_POSITION'
export const SET_FILTERS = 'SET_FILTERS'

// Creators
export function setCanvas(canvas) {
  return { type : SET_CANVAS, canvas }
}
export function setCanvasImage(canvasImage) {
  return { type : SET_CANVAS_IMAGE, canvasImage }
}
export function setTotalBands(totalBands) {
  return { type : SET_TOTAL_BANDS, totalBands }
}
export function setSelectedBands(selectedBands) {
  return { type : SET_SELECTED_BANDS, selectedBands }
}
export function setCanvasDimensions(canvasDimensions) {
  return { type : SET_CANVAS_DIMENSIONS, canvasDimensions }
}
export function setCanvasScale(canvasScale) {
  return { type : SET_CANVAS_SCALE, canvasScale }
}
export function setCanvasPosition(canvasPosition) {
  return { type : SET_CANVAS_POSITION, canvasPosition }
}
export function setFilters(filters) {
  return { type : SET_FILTERS, filters }
}

// Reducer
export function canvasReducer(state, action) {
  switch (action.type) {
    case SET_CANVAS:
      return {
        ...state,
        canvas : action.canvas,
      };
    case SET_CANVAS_IMAGE:
      return {
        ...state,
        canvasImage : action.canvasImage,
      };
    case SET_TOTAL_BANDS:
      return {
        ...state,
        totalBands : action.totalBands,
      };
    case SET_SELECTED_BANDS:
      return {
        ...state,
        selectedBands : action.selectedBands,
      };
    case SET_CANVAS_DIMENSIONS:
      return {
        ...state,
        canvasDimensions : action.canvasDimensions,
      };
    case SET_CANVAS_SCALE:
      return {
        ...state,
        canvasScale : action.canvasScale,
      };
    case SET_CANVAS_POSITION:
      return {
        ...state,
        canvasPosition : action.canvasPosition,
      };
    case SET_FILTERS:
      return {
        ...state,
        filters : action.filters,
      };
    default:
      return state;
  }
}

function CanvasProvider(props) {
  const [canvas, dispatch] = useReducer(canvasReducer, initialState);

  const canvasData = { canvas, dispatch };

  return <CanvasContext.Provider value={canvasData} {...props} />;
}

function useCanvasContext() {
  return useContext(CanvasContext);
}

export { CanvasProvider, useCanvasContext };
