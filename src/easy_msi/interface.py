import os
from tkinter import *
import tkinter.messagebox as messagebox
import customtkinter as ctk
from functools import partial
from PIL import Image

from constants import Constants
from settings import Settings
from project import Project
from files import Files

files = Files()
constants = Constants()
app_settings = Settings()
app_settings.load(constants.settings_path)

class Interface:

    def __init__(self):
        # Basic window setup
        self.root = ctk.CTk()
        self.root.bind('<Button-1>', self.defocus_event)
        self.navigation_frame = ctk.CTkFrame(self.root, corner_radius=0, width=300)
        self.navigation_frame.columnconfigure(0, { 'minsize':300 })
        self.display_frame = ctk.CTkFrame(self.root, corner_radius=0, fg_color="transparent")
        self.delete_image = ctk.CTkImage(Image.open(os.path.join(constants.basedir, "assets", "trash-icon.png")), size=(20, 20))

    def defaults(self):
        # CTK theme
        ctk.set_default_color_theme(constants.color_theme)
        # Setting taskbar icon
        try:
            from ctypes import windll  # Only exists on Windows.
            myappid = constants.windows_app_id
            windll.shell32.SetCurrentProcessExplicitAppUserModelID(myappid)
        except ImportError:
            pass
        # Window icon
        self.root.iconbitmap(os.path.join(constants.basedir, "assets/", "icon.ico"))

    def setup(self):
        # Setting up window
        self.root.geometry(constants.window_size)
        self.root.title(constants.app_name)
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(1, weight=1)

        # Navigation frame
        self.navigation_frame.grid(row=0, column=0, sticky="nsew")
        self.navigation_frame.grid_rowconfigure(4, weight=1)

        # Workspace column
        self.display_frame.grid(row=0, column=1, sticky="nsew", pady=10, padx=10)
        self.display_frame.grid_columnconfigure(0, weight=1)

        # Content into left column
        self.populate_list_frame()

        # Content into right column
        self.populate_display_frame()

    def populate_list_frame(self):
       for widget in self.navigation_frame.winfo_children():
           widget.destroy()
       # Left column folders
       for idx, project in enumerate(app_settings.projects):
            hover_color = "gray30" if idx == app_settings.current_project else ("gray70", "gray30")
            folder_button = ctk.CTkButton(self.navigation_frame, corner_radius=0, height=40, border_spacing=10, text=project.name,
                                                   fg_color="transparent", text_color=("gray10", "gray90"), hover_color=hover_color,
                                                   anchor="w", command=partial(self.open_folder, idx))
            folder_button.grid(row=idx, column=0, sticky="ew")
       # Left column button
       add_folder_button = ctk.CTkButton(self.navigation_frame, text=constants.add_project_button, height=30, command=self.add_project)
       add_folder_button.place(relx=0.5, rely=0.5, anchor=CENTER)
       add_folder_button.grid(column=0, row=len(app_settings.projects), pady=10)

    def populate_display_frame(self):
       for widget in self.display_frame.winfo_children():
            widget.destroy()

       if app_settings.current_project > -1:
            # Entry for name of project
            name_string = StringVar(self.root, app_settings.projects[app_settings.current_project].name)
            name_string.trace_add("write", partial(self.save_project_name, name_string))
            name_entry = ctk.CTkEntry(self.display_frame,
                textvariable=name_string,
                placeholder_text=constants.placeholder_name, font=ctk.CTkFont(size=20, weight="bold"),
                corner_radius=4, fg_color="transparent", width=300)
            name_entry.grid(column=0, row=0)
            name_entry.place(anchor=NW)
            # Label with path
            path_label_text = app_settings.projects[app_settings.current_project].path + " (" + str(files.tifs_in_folder(app_settings.projects[app_settings.current_project].path)) + " TIF images)"
            path_label = ctk.CTkLabel(self.display_frame, text=path_label_text, fg_color="transparent")
            path_label.grid(column=0, row=1, sticky="w")
            # Delete button
            delete_button = ctk.CTkButton(self.display_frame, text="", height=30, width=50, image=self.delete_image, fg_color="#cf142b", hover_color="#6f222c", command=self.remove_project)
            delete_button.place(anchor=NE)
            delete_button.grid(column=2, row=0)
            # Creating step tabs
            self.root.update()
            tabview = ctk.CTkTabview(self.display_frame, width=250)
            tabview._segmented_button.configure(font=ctk.CTkFont(size=15))
            tabview.grid(row=2, column=0, padx=(10, 10), pady=(20, 0), columnspan=3, sticky="we")
            # Resize tab
            tabview.add(constants.resize_tab_title)
            resize_instructions = ctk.CTkLabel(
                tabview.tab(constants.resize_tab_title),
                justify="left",
                wraplength=self.display_frame.winfo_width() - 250,
                text=constants.resize_tab_description
            )
            resize_instructions.place(anchor=NW)
            resize_instructions.grid(sticky="we")
            tabview.tab(constants.resize_tab_title).grid_columnconfigure(0, weight=1)
            # Process tab
            tabview.add(constants.process_tab_title)
            tabview.add(constants.select_tab_title)
            tabview.tab(constants.process_tab_title).grid_columnconfigure(0, weight=1)
       else:
           # Workspace column default text
           label = ctk.CTkLabel(self.display_frame, text=constants.empty_instructions)
           label.place(relx=0.5, rely=0.5, anchor=CENTER)


    def add_project(self):
        file_path = ctk.filedialog.askdirectory()
        if (len(file_path) != 0):
            new_project = Project()
            new_project.path = file_path
            projects = app_settings.projects
            projects.append(new_project)
            app_settings.projects = projects
            app_settings.current_project = len(projects)
            app_settings.save(constants.settings_path)
            self.populate_list_frame()

    def remove_project(self):
        answer = messagebox.askokcancel(constants.delete_title, constants.delete_description)
        if answer == True:
            projects = app_settings.projects
            projects.pop(app_settings.current_project)
            app_settings.projects = projects
            app_settings.current_project = -1
            app_settings.save(constants.settings_path)
            self.populate_list_frame()
            self.populate_display_frame()

    def save_project_name(self, name_string, arg1, arg2, arg3):
        projects = app_settings.projects
        projects[app_settings.current_project].name = name_string.get()
        app_settings.projects = projects
        app_settings.save(constants.settings_path)
        self.populate_list_frame()
        return True

    def open_folder(self, idx):
        app_settings.current_project = idx
        app_settings.save(constants.settings_path)
        self.populate_list_frame()
        self.populate_display_frame()

    def defocus_event(self, event):
        x,y = self.root.winfo_pointerxy()
        widget = self.root.winfo_containing(x,y)
        if "Entry" not in type(widget).__name__:
            self.root.focus()
