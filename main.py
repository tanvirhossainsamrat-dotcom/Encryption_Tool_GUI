import eel
import sys
import os
import tempfile
import base64
import mimetypes
import shutil
import tkinter as tk
from tkinter import filedialog
import json
import platform
import subprocess

# --- PYINSTALLER PATH ROUTING ---
def resource_path(relative_path):
    try: base_path = sys._MEIPASS
    except Exception: base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

eel.init(resource_path('.'))

# --- SECURE DIRECTORY MANAGEMENT ---
def get_base_dir():
    # Force the Vault_Data folder to spawn exactly next to main.py
    if getattr(sys, 'frozen', False):
        base_path = os.path.dirname(sys.executable)
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
        
    vault_folder = os.path.join(base_path, 'Vault_Data')
    if not os.path.exists(vault_folder):
        os.makedirs(vault_folder, exist_ok=True)
    return vault_folder

def get_full_path(subpath):
    base = get_base_dir()
    if subpath:
        subpath = subpath.lstrip('\\/')
        full = os.path.abspath(os.path.join(base, subpath))
        if full.startswith(base): return full
    return base

@eel.expose
def close_python():
    os._exit(0)

# --- NATIVE FILE PICKER ---
@eel.expose
def import_document_dialog(current_path=""):
    try:
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True) 
        file_path = filedialog.askopenfilename(title="Select a file to Vault")
        root.destroy()
        
        if not file_path: return {"status": "cancelled"}

        filename = os.path.basename(file_path)
        target_dir = get_full_path(current_path)
        dest_path = os.path.join(target_dir, filename)
        
        if file_path != dest_path:
            shutil.copy2(file_path, dest_path)
        
        return {"status": "success", "filename": filename}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- VAULT I/O OPERATIONS ---
@eel.expose
def get_vaulted_files(current_path=""):
    try:
        target_dir = get_full_path(current_path)
        items = []
        for f in os.listdir(target_dir):
            full_item = os.path.join(target_dir, f)
            if os.path.isdir(full_item):
                items.append({"name": f, "type": "folder"})
            else:
                items.append({"name": f, "type": "file"})
        items.sort(key=lambda x: (x['type'] == 'file', x['name'].lower()))
        return items
    except Exception as e:
        return []

@eel.expose
def read_vaulted_file(filename, current_path=""):
    try:
        target_dir = get_full_path(current_path)
        filepath = os.path.join(target_dir, filename)
        
        if not os.path.exists(filepath): return {"error": "File not found."}
        
        file_size = os.path.getsize(filepath)
        mime_type, _ = mimetypes.guess_type(filepath)
        if not mime_type: mime_type = 'application/octet-stream'
        
        with open(filepath, 'rb') as f: 
            b64_data = base64.b64encode(f.read()).decode('utf-8')
            
        return {"filename": filename, "mime": mime_type, "size": file_size, "data": b64_data}
    except Exception as e: return {"error": str(e)}

@eel.expose
def create_vault_folder(folder_name, current_path=""):
    try:
        target_dir = get_full_path(current_path)
        new_dir = os.path.join(target_dir, folder_name)
        if os.path.exists(new_dir): return "Error: Folder already exists."
        os.makedirs(new_dir, exist_ok=True)
        print(f"[VAULT] Created folder: {new_dir}")
        return "Success"
    except Exception as e: return f"Error: {str(e)}"

@eel.expose
def create_vault_file(filename, current_path="", content=""):
    try:
        target_dir = get_full_path(current_path)
        filepath = os.path.join(target_dir, filename)
        if os.path.exists(filepath): return "Error: File already exists."
        with open(filepath, 'w', encoding='utf-8') as f: 
            f.write(content)
        print(f"[VAULT] Saved new file to: {filepath}")
        return f"Success|{filepath}"
    except Exception as e: return f"Error: {str(e)}"

@eel.expose
def save_vaulted_file(filename, current_path="", content=""):
    try:
        target_dir = get_full_path(current_path)
        filepath = os.path.join(target_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f: 
            f.write(content)
        print(f"[VAULT] Updated file at: {filepath}")
        return f"Success|{filepath}"
    except Exception as e: return f"Error: {str(e)}"

@eel.expose
def rename_vault_item(old_name, new_name, current_path=""):
    try:
        target_dir = get_full_path(current_path)
        old_path = os.path.join(target_dir, old_name)
        new_path = os.path.join(target_dir, new_name)
        if not os.path.exists(old_path): return "Error: Item not found."
        if os.path.exists(new_path): return "Error: Name already in use."
        os.rename(old_path, new_path)
        return "Success"
    except Exception as e: return f"Error: {str(e)}"

@eel.expose
def delete_vault_items(item_names, current_path=""):
    target_dir = get_full_path(current_path)
    count = 0
    for item in item_names:
        try:
            filepath = os.path.join(target_dir, item)
            if os.path.isdir(filepath): shutil.rmtree(filepath)
            else: os.remove(filepath)
            count += 1
        except Exception: pass
    return count

@eel.expose
def copy_vault_items(item_names, current_path=""):
    target_dir = get_full_path(current_path)
    count = 0
    for item in item_names:
        try:
            src = os.path.join(target_dir, item)
            name, ext = os.path.splitext(item)
            if os.path.isdir(src):
                dst = os.path.join(target_dir, f"{item}_copy")
                shutil.copytree(src, dst)
            else:
                dst = os.path.join(target_dir, f"{name}_copy{ext}")
                shutil.copy2(src, dst)
            count += 1
        except Exception: pass
    return count

@eel.expose
def move_vault_items(item_names, current_path=""):
    target_dir = get_full_path(current_path)
    archive_folder = os.path.join(get_base_dir(), 'Archive')
    if not os.path.exists(archive_folder): os.makedirs(archive_folder, exist_ok=True)
    count = 0
    for item in item_names:
        try:
            shutil.move(os.path.join(target_dir, item), os.path.join(archive_folder, item))
            count += 1
        except Exception: pass
    return count

# ==========================================
# CONFIGURATION & EXPLORER ROUTING ADDITIONS
# ==========================================

# Force the Config file to spawn exactly next to main.py
if getattr(sys, 'frozen', False):
    APP_DIR = os.path.dirname(sys.executable)
else:
    APP_DIR = os.path.dirname(os.path.abspath(__file__))

CONFIG_FILE = os.path.join(APP_DIR, 'SecureVault_Config.json')

# --- AGGRESSIVE STARTUP LOGGING ---
print("\n" + "="*60)
print("🚀 SECURE VAULT ENGINE STARTED 🚀")
print(f"📁 EXPECTED CONFIG PATH: {CONFIG_FILE}")
print("="*60 + "\n")

def force_open_folder(path):
    """Helper function to open folders across different operating systems"""
    if platform.system() == "Windows":
        os.startfile(path)
    elif platform.system() == "Darwin": # macOS
        subprocess.Popen(["open", path])
    else: # Linux
        subprocess.Popen(["xdg-open", path])

@eel.expose
def save_matrix_config(settings):
    try:
        print(f"[SETTINGS] Attempting to save config to: {CONFIG_FILE}")
        with open(CONFIG_FILE, 'w') as f:
            json.dump(settings, f, indent=4)
        print("[SETTINGS] Config successfully saved!")
        return {"status": "success", "exact_path": CONFIG_FILE}
    except Exception as e:
        print(f"[SETTINGS ERROR] {str(e)}")
        return {"error": str(e)}

@eel.expose
def load_matrix_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            return {"error": str(e)}
    return None

@eel.expose
def open_config_directory():
    try:
        if not os.path.exists(APP_DIR):
            os.makedirs(APP_DIR)
            
        print(f"[EXPLORER] Opening config folder: {APP_DIR}")
        force_open_folder(APP_DIR)
        return {"status": "success", "path": APP_DIR}
    except Exception as e:
        return {"error": str(e)}

@eel.expose
def open_vault_directory(current_path=""):
    try:
        target_dir = get_full_path(current_path)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            
        print(f"[EXPLORER] Opening vault folder: {target_dir}")
        force_open_folder(target_dir)
        return {"status": "success", "path": target_dir}
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    get_base_dir() # Ensures folder exists BEFORE Eel boots

    is_compiled = getattr(sys, 'frozen', False)
    if is_compiled:
        profile_dir = os.path.join(tempfile.gettempdir(), 'SecureVault_Profile')
        port_num = 0 
    else:
        profile_dir = os.path.join(os.path.abspath("."), '.dev_profile')
        port_num = 8080 

    browser_flags = [
        '--kiosk', '--disable-infobars', '--disable-notifications',
        '--autoplay-policy=no-user-gesture-required', f'--user-data-dir={profile_dir}'
    ]

    try: eel.start('Application.html', mode='chrome', port=port_num, cmdline_args=browser_flags)
    except Exception:
        try: eel.start('Application.html', mode='edge', port=port_num, cmdline_args=browser_flags)
        except Exception: eel.start('Application.html', mode='default', port=port_num)

eel.exit()