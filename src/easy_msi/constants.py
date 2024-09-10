import os

class Constants:

    def __init__(self):
        self.app_name = "Easy MSI"
        self.windows_app_id = "mapster.easymsi.1"
        self.basedir = os.path.dirname(__file__)
        self.settings_path = os.path.join(os.path.dirname(__file__), "saved/", "settings.pickle")
        # Interface settings
        self.color_theme = "green"
        self.window_size = "1100x600"
        # Strings
        self.empty_instructions = "To get started, select a folder with all your TIFs in it."
        self.add_project_button = "Add a new project"
        self.placeholder_name = "Project Name"
        self.delete_title = "Confirm Deletion"
        self.delete_description = "Are you sure you want to remove this project? This can't be undone."
        self.resize_tab_title = "1. Resize"
        self.resize_tab_description = "This will resize your images so they can be processed more quickly and easily."
        self.process_tab_title = "2. Process"
        self.process_tab_description = "2. Process"
        self.select_tab_title = "3. Select"
        self.select_tab_description = "1. Resize"
