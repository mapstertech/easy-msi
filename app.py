import os
import sys
import numpy as np
from skimage import io, exposure
from PIL import Image
from flask import Flask, jsonify, request
from flask_cors import CORS

from app_utils import process_images

app = Flask(__name__)
app_config = {"host": "0.0.0.0", "port": sys.argv[1]}

"""
---------------------- DEVELOPER MODE CONFIG -----------------------
"""
# Developer mode uses app.py
if "app.py" in sys.argv[0]:
  # Update app config
  app_config["debug"] = True

  # CORS settings
  cors = CORS(
    app,
    resources={r"/*": {"origins": "http://localhost*"}},
  )

  # CORS headers
  app.config["CORS_HEADERS"] = "Content-Type"


"""
--------------------------- REST CALLS -----------------------------
"""
@app.route("/get-project-info", methods=["POST"])
def get_files():
    path = request.json.get('path')
    files = []
    for file_name in os.listdir(path):
        if ".tif" in file_name:
            file_path = os.path.join(path, file_name)
            file = {
                "name" : file_name,
                "path" : file_path,
                "size" : os.path.getsize(file_path)
            }
            files.append(file)
    processed_path = os.path.join(path, 'processed')
    processed_files = []
    if os.path.exists(processed_path):
        for file_name in os.listdir(processed_path):
            if ".tif" in file_name:
                file_path = os.path.join(processed_path, file_name)
                file = {
                    "name" : file_name,
                    "path" : file_path,
                    "size" : os.path.getsize(file_path)
                }
                processed_files.append(file)
    resized_path = os.path.join(path, 'resized')
    resized_files = []
    if os.path.exists(resized_path):
        for file_name in os.listdir(resized_path):
            if ".tif" in file_name:
                file_path = os.path.join(resized_path, file_name)
                file = {
                    "name" : file_name,
                    "path" : file_path,
                    "size" : os.path.getsize(file_path)
                }
                resized_files.append(file)
    resized_processed_path = os.path.join(path, 'resized', 'processed')
    resized_processed_files = []
    if os.path.exists(resized_processed_path):
        for file_name in os.listdir(resized_processed_path):
            if ".tif" in file_name:
                file_path = os.path.join(resized_processed_path, file_name)
                file = {
                    "name" : file_name,
                    "path" : file_path,
                    "size" : os.path.getsize(file_path)
                }
                resized_processed_files.append(file)
    response = {
        "files" : files,
        "processed_files" : processed_files,
        "resized_files" : resized_files,
        "resized_processed_files" : resized_processed_files
    }
    return jsonify(response)


@app.route("/resize-images", methods=["POST"])
def resize_images():
    path = request.json.get('path')
    resized_path = os.path.join(path, 'resized')
    new_image_width = 1500
    resized_files = []

    if not os.path.exists(resized_path):
        os.makedirs(resized_path)
    for file_name in os.listdir(path):
        if ".tif" in file_name:
            image = io.imread(os.path.join(path, file_name))
            if image.ndim == 3:
                # Assuming image is in the format of [bands, height, width]
                bands, height, width = image.shape
            elif image.ndim == 2:
                # Assuming image is in the format of [height, width], add a dummy bands dimension
                bands = 1  # Single band
                height, width = image.shape
                image = image[np.newaxis, :, :]  # Add a new axis to make it 3D
            else:
                raise ValueError("Image has an unsupported number of dimensions")
            resize_ratio = width / new_image_width
            new_height = round(height / resize_ratio)

            image_for_resize = Image.open(os.path.join(path, file_name))
            new_image = image_for_resize.resize((new_image_width, new_height))
            new_path = os.path.join(resized_path, file_name)
            new_image.save(new_path)

            file = {
                "name" : file_name,
                "path" : new_path,
                "size" : os.path.getsize(new_path)
            }
            resized_files.append(file)
    response = {
        "resized_files" : resized_files
    }
    return jsonify(response)

@app.route("/process-folder", methods=["POST"])
def process_folder():
    path = request.json.get('path')
    folder = request.json.get('folder')
    path_to_process = os.path.join(path, folder)
    processed_path = os.path.join(path, folder, 'processed')
    processed_files = []

    if not os.path.exists(processed_path):
        os.makedirs(processed_path)

    processed_files = process_images(path_to_process, processed_path)
    response = {
        "folder" : folder,
        "processed_files" : processed_files
    }

    return jsonify(response)

"""
-------------------------- APP SERVICES ----------------------------
"""
# Quits Flask on Electron exit
@app.route("/quit")
def quit():
  shutdown = request.environ.get("werkzeug.server.shutdown")
  shutdown()

  return


if __name__ == "__main__":
  app.run(**app_config)
