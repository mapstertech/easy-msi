
export const findAvailableSpace = (imageDimensions) => {
  let totalWindowWidth = window.innerWidth;
  let totalWindowHeight = window.innerHeight ;
  let projectsWidth = document.getElementById('projects').offsetWidth;
  let titlebarHeight = document.getElementById('titlebar').offsetHeight;
  let workspaceHeaderHeight = document.getElementById('workspace-header').offsetHeight;

  let margins = 20;
  let availableWidth = totalWindowWidth - projectsWidth - (margins * 2);
  let availableHeight = totalWindowHeight - titlebarHeight - workspaceHeaderHeight - (margins * 2);

  let width = 0;
  let height = 0
  // If there is less space available for the height, then it's the smaller side
  let imageRatio = imageDimensions[0] / imageDimensions[1];
  if((availableWidth/availableHeight) > imageRatio) {
    height = availableHeight;
    width = availableHeight * (imageDimensions[0] / imageDimensions[1])
  } else {
    width = availableWidth;
    height = availableWidth * (imageDimensions[1] / imageDimensions[0])
  }
  return [width, height]
}
