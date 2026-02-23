from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import easyocr
import cv2
import numpy as np
import re
from rapidfuzz import fuzz

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
# client = MongoClient("mongodb+srv://team_db_user:DXIQvBqkPDmGh5ec@ingredient.fydx6zw.mongodb.net/")
db = client["food_db"]
collection = db["ingredients"]

# EasyOCR
reader = easyocr.Reader(['en'], gpu=False)


# =========================
# CLEAN TEXT FUNCTION
# =========================
def clean_ingredient_text(text):

    text = text.lower()

    # Remove content inside brackets
    text = re.sub(r"\(.*?\)", "", text)
    text = re.sub(r"\[.*?\]", "", text)

    # Replace semicolon with comma
    text = text.replace(";", ",")

    # Remove unwanted characters
    text = re.sub(r"[^a-z,\-\s]", " ", text)

    # Replace multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# =========================
# EXTRACT ENDPOINT
# =========================
@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):

    contents = await file.read()

    npimg = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # EasyOCR extraction
    results = reader.readtext(image, detail=0)
    raw_text = " ".join(results)

    print("========== RAW OCR ==========")
    print(raw_text)
    print("=============================")

    cleaned_text = clean_ingredient_text(raw_text)

    # Ingredients usually comma separated
    ingredients = cleaned_text.split(",")
    cleaned = [i.strip() for i in ingredients if len(i.strip()) > 2]

    print("CLEANED:", cleaned)

    # Get all ingredients from DB
    allowed_docs = list(collection.find({}, {"_id": 0}))

    found = []
    missing = []

    for ingredient in cleaned:
        matched = False

        for item in allowed_docs:
            db_name = item["name"].lower()

            # Direct match (most important)
            if db_name in ingredient or ingredient in db_name:
                found.append(item)
                matched = True
                break

            # Fuzzy match
            if fuzz.ratio(ingredient, db_name) > 80:
                found.append(item)
                matched = True
                break

        if not matched:
            missing.append(ingredient)

    return {
        "found": found,
        "missing": missing
    }




# version two ⭐

# from fastapi import FastAPI, UploadFile, File
# from pymongo import MongoClient
# import pytesseract
# from PIL import Image
# import io
# import re
# from difflib import SequenceMatcher

# app = FastAPI()

# client = MongoClient("mongodb://localhost:27017/")
# db = client["food_db"]
# collection = db["ingredients"]

# pytesseract.pytesseract.tesseract_cmd = r"C:\Users\mahes\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"


# # =========================
# # FUZZY MATCH FUNCTION
# # =========================
# def similar(a, b):
#     return SequenceMatcher(None, a, b).ratio()


# # =========================
# # CLEAN TEXT FUNCTION
# # =========================
# def clean_ingredient_text(text):

#     # Remove content inside brackets
#     text = re.sub(r"\(.*?\)", "", text)
#     text = re.sub(r"\[.*?\]", "", text)

#     # Remove unwanted symbols but keep letters, commas, hyphen
#     text = re.sub(r"[^A-Za-z,\-\s]", " ", text)

#     # Replace multiple spaces
#     text = re.sub(r"\s+", " ", text)

#     return text.strip().lower()


# @app.post("/extract-text")
# async def extract_text(file: UploadFile = File(...)):

#     contents = await file.read()
#     image = Image.open(io.BytesIO(contents))

#     # Better OCR config for ingredient blocks
#     custom_config = r'--oem 3 --psm 6'
#     raw_text = pytesseract.image_to_string(image, config=custom_config)

#     print("========== RAW OCR ==========")
#     print(raw_text)
#     print("=============================")

#     cleaned_text = clean_ingredient_text(raw_text)

#     # Split only by comma (because ingredients are comma separated)
#     ingredients = cleaned_text.split(",")

#     cleaned = [i.strip() for i in ingredients if len(i.strip()) > 2]

#     print("CLEANED:", cleaned)

#     allowed_docs = list(collection.find({}, {"_id": 0}))

#     found = []
#     missing = []

#     for ingredient in cleaned:
#         matched = False

#         for item in allowed_docs:
#             db_name = item["name"].lower()

#             # Direct match
#             if db_name in ingredient or ingredient in db_name:
#                 found.append(item)
#                 matched = True
#                 break

#             # Fuzzy match (important 🔥)
#             if similar(ingredient, db_name) > 0.75:
#                 found.append(item)
#                 matched = True
#                 break

#         if not matched:
#             missing.append(ingredient)

#     return {
#         "found": found,
#         "missing": missing
#     }


# version one ⭐

# from fastapi import FastAPI, UploadFile, File
# from pymongo import MongoClient
# import pytesseract
# from PIL import Image
# import io
# import re

# app = FastAPI()

# # MongoDB connection
# client = MongoClient("mongodb://localhost:27017/")
# db = client["food_db"]
# collection = db["ingredients"]

# pytesseract.pytesseract.tesseract_cmd = r"C:\Users\mahes\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"


# @app.post("/extract-text")
# async def extract_text(file: UploadFile = File(...)):

#     contents = await file.read()
#     image = Image.open(io.BytesIO(contents))

#     text = pytesseract.image_to_string(image)

#     print("========== OCR RESULT ==========")
#     print(text)
#     print("================================")

#     # Clean text
#     ingredients = re.split(r",|\n|-|:", text.lower())
#     cleaned = [i.strip() for i in ingredients if i.strip()]

#     print("CLEANED INGREDIENTS:", cleaned)

#     # Get allowed ingredients from MongoDB
#     # allowed = [item["name"].lower() for item in collection.find()]
#     allowed_docs = list(collection.find({}, {"_id": 0}))


#     # found = []
#     # missing = []

#     # for ingredient in cleaned:
#     #     if any(a in ingredient for a in allowed):
#     #         found.append(ingredient)
#     #     else:
#     #         missing.append(ingredient)

#     # print("FOUND:", found)
#     # print("MISSING:", missing)

#     # return {
#     #     "found": found,
#     #     "missing": missing
#     # }
#     found = []
#     missing = []

#     for ingredient in cleaned:
#         matched = False

#         for item in allowed_docs:
#             if item["name"].lower() in ingredient:
#                 found.append(item)
#                 matched = True
#                 break

#         if not matched:
#             missing.append(ingredient)

#     print("FOUND:", found)
#     print("MISSING:", missing)

#     return {
#         "found": found,
#         "missing": missing
#     }
