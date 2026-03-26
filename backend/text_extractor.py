"""
Text Extraction Layer — supports PDF, Image (OCR), and TXT files.
"""

import os
import re
from dotenv import load_dotenv

load_dotenv()

# ── PDF Extraction ────────────────────────────────────────────────────────────

def extract_from_pdf(file_storage) -> str:
    """Extract text from a PDF file upload (werkzeug FileStorage)."""
    from PyPDF2 import PdfReader

    reader = PdfReader(file_storage)
    pages_text = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages_text.append(text)
    return "\n".join(pages_text).strip()


# ── Image / OCR Extraction ────────────────────────────────────────────────────

def extract_from_image(file_storage) -> str:
    """Extract text from an image using Tesseract OCR."""
    import pytesseract
    from PIL import Image

    # Allow overriding the Tesseract path via env var
    tess_path = os.getenv("TESSERACT_PATH")
    if tess_path:
        pytesseract.pytesseract.tesseract_cmd = tess_path

    image = Image.open(file_storage)
    text = pytesseract.image_to_string(image)
    return text.strip()


# ── TXT Extraction ────────────────────────────────────────────────────────────

def extract_from_txt(file_storage) -> str:
    """Read plain text directly from a .txt file upload."""
    content = file_storage.read()
    # Handle both bytes and string
    if isinstance(content, bytes):
        content = content.decode("utf-8", errors="ignore")
    return content.strip()


# ── Dispatcher ────────────────────────────────────────────────────────────────

def extract_text(file_storage, filename: str) -> str:
    """
    Detect file type from filename extension and extract text accordingly.
    Returns the extracted text as a string.
    """
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        return extract_from_pdf(file_storage)
    elif ext in (".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"):
        return extract_from_image(file_storage)
    elif ext == ".txt":
        return extract_from_txt(file_storage)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
