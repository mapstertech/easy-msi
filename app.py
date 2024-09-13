import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

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
@app.route("/get-files", methods=["POST"])
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
  return jsonify(files)


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
