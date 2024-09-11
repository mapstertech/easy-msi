import os

from models import File

class Files:

    def number_tifs_in_folder(self, path):
        files = len(self.tifs_in_folder(path))
        return files

    def tifs_in_folder(self, path):
        files = []
        for file_name in os.listdir(path):
            if ".tif" in file_name:
                file = File()
                file.name = file_name
                file.path = os.path.join(path, file_name)
                file.size = os.path.getsize(file.path)
                files.append(file)
        return files
