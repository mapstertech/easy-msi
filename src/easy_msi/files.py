import os

class Files:

    def tifs_in_folder(self, path):
        files = len([name for name in os.listdir(path) if ".tif" in name])
        return files
