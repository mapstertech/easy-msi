# Easy MSI

Welcome to Easy MSI! This desktop application is originally built for scholars trying to understand and use *multi-spectral imaging*. It encourages you to start your image processing and analysis in a straightforward way, reducing the need for heavy processing power.

## How It Works

First, you need some TIF images generated from a multi-spectral camera. Generally you will start with some kind of raw files, either RAW or DNG. Once you have those in a TIF format, you essentially have each different spectrum of light captured in a single TIF image. However, if you try to look at these files directly, they don't look like anything.

In other MSI processing, you run Python scripts or open applications that almost ruin your computer by trying to process these enormous images right away. Easy MSI approaches this differently. Here's how the process works:

1. Load the folder where you have your TIF images.
2. Run a process to create copies of your TIFs at a reduced size (1500 pixels wide).
3. Create a variety of combined images according to various MSI algorithms.
4. View those images and manually adjust filters on the image to see if anything useful appears.
5. Choose an area of the image to target, and redo processing on that specific area only.

By resizing your images in Step 2, Easy MSI makes it possible for any computer to get started with MSI, and makes the process fast. Yet you can still get enormous detail by targeting your areas of interest and running as many rounds of processing as you like.

## Features

- Load any number of TIFs and resize them without losing the originals
- Saving your current image and display options at all times
- Allows processing on full-size TIFs (only use if you have a strong computer) or resized TIFs
- Targeting and processing of areas of interest
- Save processed and filtered images to your computer at full quality
- Unlimited number of projects and images

## Developer Information

This project is a hobby project, so it's not really built in the most optimal way. The program is unnecessarily large, but it was what I found easiest in building the program and iterating on it quickly.

Easy MSI is built with Electron, React, and a Python backend for processing. The boilerplate repo is here: https://github.com/iPzard/electron-react-python-template. You can find all the instructions for development and building binaries on that page. The project is relatively simple to develop, just a few Node installs and scripts to run. You may have to downgrade to an older version of Node (16) since the boilerplate is a little out of date. There may also be some trouble building the final install files, since you need to have Wix Toolset 3 (not the latest version).

It's too big. I'm working on fixing that in a future version! For now, I'm just proving that this project does anything useful.

Future functionality planned:

- 3D visualization a la GeoTIFFs
- Splitting up processed images into galleries to quickly scan for any areas of interest
- Processing ICAs and non-PCA files (I have to learn some things...)

Developed by Victor Temprano (Mapster Technology Inc), after attending the 2024 Vercelli MSI workshop put on by Videntes (https://videntesmsi.com/).
