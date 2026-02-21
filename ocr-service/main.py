# from fastapi import FastAPI, File, UploadFile
# import easyocr
# import cv2
# import numpy as np
# from rapidfuzz import fuzz, process

# app = FastAPI()

# # Initialize EasyOCR reader (English)
# reader = easyocr.Reader(['en'], gpu=False)

# # Sample Ingredient Master List (Temporary)
# # Later we will fetch from DB
# MASTER_INGREDIENTS = [
#     "sugar",
#     "salt",
#     "glucose syrup",
#     "palm oil",
#     "milk solids",
#     "wheat flour",
#     "corn starch",
#     "citric acid",
#     "natural flavors",
#     "artificial colors"
# ]

# def clean_text(text):
#     text = text.lower()
#     text = text.replace("\n", " ")
#     text = text.replace(",", " ")
#     text = text.replace(".", " ")
#     return text

# def extract_ingredients(text):
#     words = text.split()
#     found = []

#     for ingredient in MASTER_INGREDIENTS:
#         match = process.extractOne(
#             ingredient,
#             words,
#             scorer=fuzz.partial_ratio
#         )
#         if match and match[1] > 80:
#             found.append(ingredient)

#     return list(set(found))

# @app.post("/extract-text")
# async def extract_text(file: UploadFile = File(...)):
#     contents = await file.read()

#     npimg = np.frombuffer(contents, np.uint8)
#     image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

#     # OCR
#     results = reader.readtext(image, detail=0)
#     full_text = " ".join(results)

#     cleaned = clean_text(full_text)
#     ingredients = extract_ingredients(cleaned)

#     return {
#         "raw_text": full_text,
#         "ingredients_found": ingredients
#     }



# version two ⭐

from fastapi import FastAPI, UploadFile, File
from pymongo import MongoClient
import pytesseract
from PIL import Image
import io
import re
from difflib import SequenceMatcher

app = FastAPI()

client = MongoClient("mongodb://localhost:27017/")
db = client["food_db"]
collection = db["ingredients"]

pytesseract.pytesseract.tesseract_cmd = r"C:\Users\mahes\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"


# =========================
# FUZZY MATCH FUNCTION
# =========================
def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()


# =========================
# CLEAN TEXT FUNCTION
# =========================
def clean_ingredient_text(text):

    # Remove content inside brackets
    text = re.sub(r"\(.*?\)", "", text)
    text = re.sub(r"\[.*?\]", "", text)

    # Remove unwanted symbols but keep letters, commas, hyphen
    text = re.sub(r"[^A-Za-z,\-\s]", " ", text)

    # Replace multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip().lower()


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):

    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    # Better OCR config for ingredient blocks
    custom_config = r'--oem 3 --psm 6'
    raw_text = pytesseract.image_to_string(image, config=custom_config)

    print("========== RAW OCR ==========")
    print(raw_text)
    print("=============================")

    cleaned_text = clean_ingredient_text(raw_text)

    # Split only by comma (because ingredients are comma separated)
    ingredients = cleaned_text.split(",")

    cleaned = [i.strip() for i in ingredients if len(i.strip()) > 2]

    print("CLEANED:", cleaned)

    allowed_docs = list(collection.find({}, {"_id": 0}))

    found = []
    missing = []

    for ingredient in cleaned:
        matched = False

        for item in allowed_docs:
            db_name = item["name"].lower()

            # Direct match
            if db_name in ingredient or ingredient in db_name:
                found.append(item)
                matched = True
                break

            # Fuzzy match (important 🔥)
            if similar(ingredient, db_name) > 0.75:
                found.append(item)
                matched = True
                break

        if not matched:
            missing.append(ingredient)

    return {
        "found": found,
        "missing": missing
    }


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
