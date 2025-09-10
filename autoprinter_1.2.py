import time
import os
import shutil
import json
from datetime import datetime
from PIL import Image, ImageWin
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import win32print
import win32ui
import tkinter as tk
from tkinter import filedialog, messagebox, simpledialog
from tkinter import ttk
from plyer import notification
from threading import Thread

# ---------------------------
# CONFIGURACIÓN GLOBAL
# ---------------------------

IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tiff"]

class AutoPrinterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AutoPrinter - Ravenlight 2025")
        self.root.geometry("600x450")
        self.folder = tk.StringVar()
        self.printer = tk.StringVar()
        self.log_file = None
        self.printed_folder = None
        self.config_file = "config.json"
        self.observer = None

        self.build_ui()
        self.load_config()

    def build_ui(self):
        frame = ttk.Frame(self.root, padding=20)
        frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(frame, text="📁 Carpeta a monitorear:").pack(anchor="w")
        ttk.Entry(frame, textvariable=self.folder, width=60).pack()
        ttk.Button(frame, text="Seleccionar Carpeta", command=self.select_folder).pack(pady=5)

        ttk.Label(frame, text="🖨️ Impresora seleccionada:").pack(anchor="w")
        ttk.Entry(frame, textvariable=self.printer, width=60).pack()
        ttk.Button(frame, text="Seleccionar Impresora", command=self.select_printer).pack(pady=5)

        ttk.Button(frame, text="▶️ Iniciar Monitoreo", command=self.start_monitoring).pack(pady=10)
        ttk.Button(frame, text="🛑 Detener", command=self.stop_monitoring).pack()

        self.status_label = ttk.Label(frame, text="Estado: Esperando", foreground="blue")
        self.status_label.pack(pady=10)

    def select_folder(self):
        selected = filedialog.askdirectory()
        if selected:
            self.folder.set(selected)

    def select_printer(self):
        printers = [p[2] for p in win32print.EnumPrinters(2)]
        printer = simpledialog.askstring("Seleccionar impresora", "Elegí una impresora:\n" + "\n".join(f"{i+1}. {p}" for i, p in enumerate(printers)))
        try:
            idx = int(printer.split('.')[0]) - 1
            self.printer.set(printers[idx])
        except:
            messagebox.showerror("Error", "Selección no válida.")

    def load_config(self):
        if os.path.exists(self.config_file):
            with open(self.config_file, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                self.folder.set(cfg.get("folder", ""))
                self.printer.set(cfg.get("printer", ""))

    def save_config(self):
        with open(self.config_file, "w", encoding="utf-8") as f:
            json.dump({"folder": self.folder.get(), "printer": self.printer.get()}, f)

    def log(self, message):
        if not self.log_file:
            self.log_file = os.path.join(self.folder.get(), "impresiones.log")
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(f"[{ts}] {message}\n")
        print(f"[{ts}] {message}")

    def notify(self, title, message):
        notification.notify(title=title, message=message, timeout=5)

    def start_monitoring(self):
        if not self.folder.get() or not self.printer.get():
            messagebox.showwarning("Atención", "Debés seleccionar carpeta e impresora.")
            return

        self.save_config()
        self.status_label.config(text="Estado: Monitoreando...", foreground="green")

        class Handler(FileSystemEventHandler):
            def __init__(self, app):
                self.app = app

            def on_created(self, event):
                if not event.is_directory and os.path.splitext(event.src_path)[1].lower() in IMAGE_EXTENSIONS:
                    Thread(target=self.app.handle_image, args=(event.src_path,)).start()

        handler = Handler(self)
        self.observer = Observer()
        self.observer.schedule(handler, self.folder.get(), recursive=False)
        self.observer.start()
        self.log("🔍 Monitoreo iniciado.")
        self.notify("AutoPrinter", "Monitoreo iniciado")

    def stop_monitoring(self):
        if self.observer:
            self.observer.stop()
            self.observer.join()
            self.status_label.config(text="Estado: Detenido", foreground="red")
            self.log("🛑 Monitoreo detenido.")
            self.notify("AutoPrinter", "Monitoreo detenido")

    def handle_image(self, path):
        self.log(f"📷 Detectada imagen: {path}")
        time.sleep(2)
        success = self.print_image(path)
        if success:
            self.log("✅ Imagen impresa.")
            self.notify("Impresión completada", os.path.basename(path))
            self.move_printed(path)
        else:
            self.log("❌ Error al imprimir imagen.")
            self.notify("Error al imprimir", os.path.basename(path))

    def print_image(self, path):
        try:
            img = Image.open(path)
            hDC = win32ui.CreateDC()
            hDC.CreatePrinterDC(self.printer.get())
            printable_area = hDC.GetDeviceCaps(8), hDC.GetDeviceCaps(10)
            img_width, img_height = img.size
            scale = min(printable_area[0] / img_width, printable_area[1] / img_height)
            scaled_width = int(img_width * scale)
            scaled_height = int(img_height * scale)

            hDC.StartDoc(path)
            hDC.StartPage()
            dib = ImageWin.Dib(img)
            dib.draw(hDC.GetHandleOutput(), (0, 0, scaled_width, scaled_height))
            hDC.EndPage()
            hDC.EndDoc()
            hDC.DeleteDC()
            return True
        except Exception as e:
            self.log(f"❌ {e}")
            return False

    def move_printed(self, path):
        if not self.printed_folder:
            self.printed_folder = os.path.join(self.folder.get(), "impresas")
        if not os.path.exists(self.printed_folder):
            os.makedirs(self.printed_folder)
        dest = os.path.join(self.printed_folder, os.path.basename(path))
        shutil.move(path, dest)
        self.log(f"📂 Imagen movida a: {dest}")

if __name__ == "__main__":
    root = tk.Tk()
    app = AutoPrinterApp(root)
    root.mainloop()
