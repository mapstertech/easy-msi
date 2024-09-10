import os
import pickle

class Settings:

    # Set initial settings here.
    def __init__(self):
        self.projects = []
        self.current_project = -1

    # Property Getter and Setters to allow the application to
    # access the settings and change them
    @property
    def projects(self):
        return self._projects

    @projects.setter
    def projects(self, value):
        self._projects = value

    @property
    def current_project(self):
        return self._current_project

    @current_project.setter
    def current_project(self, value):
        self._current_project = value

    #Methods to save the settings to a file and load them from a file
    def save(self, filename):
        with open(filename, 'wb') as fo:
            pickle.dump(self, fo)

    def load(self, filename):
        if os.path.exists(filename):
            with open(filename, 'rb') as fi:
                newObj = pickle.load(fi)
            self.__dict__.update(newObj.__dict__)
