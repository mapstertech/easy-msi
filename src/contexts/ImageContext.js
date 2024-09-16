import React, { createContext, useReducer, useContext } from "react";

export const ImageContext = createContext();

const initialState = {
  imageURI : false,
  imageDimensions : [0, 0],
}

// Actions
export const SET_IMAGE_URI = 'SET_IMAGE_URI'
export const SET_IMAGE_DIMENSIONS = 'SET_IMAGE_DIMENSIONS'

// Creators
export function setImageURI(imageURI) {
  return { type : SET_IMAGE_URI, imageURI }
}
export function setImageDimensions(imageDimensions) {
  return { type : SET_IMAGE_DIMENSIONS, imageDimensions }
}

// Reducer
export function imageReducer(state, action) {
  switch (action.type) {
    case SET_IMAGE_URI:
      localStorage.setItem('imageURI', action.imageURI)
      return {
        ...state,
        imageURI : action.imageURI,
      };
    case SET_IMAGE_DIMENSIONS:
      localStorage.setItem('imageDimensions', JSON.stringify(action.imageDimensions))
      return {
        ...state,
        imageDimensions : action.imageDimensions,
      };
    default:
      return state;
  }
}

function ImageProvider(props) {
  const [image, dispatch] = useReducer(imageReducer, initialState);

  const imageData = { image, dispatch };

  return <ImageContext.Provider value={imageData} {...props} />;
}

function useImageContext() {
  return useContext(ImageContext);
}

export { ImageProvider, useImageContext };
