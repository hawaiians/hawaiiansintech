import json
import os
from firebase_admin import credentials, firestore
import firebase_admin
from dotenv import load_dotenv

if os.getenv("NODE_ENV") != "production":
    load_dotenv(".env.local")


def initialize_firebase():
    cred_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
    if not cred_json:
        raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set")
    service_account_info = json.loads(cred_json)
    cred = credentials.Certificate(service_account_info)
    firebase_admin.initialize_app(cred)
    return firestore.client()


db = initialize_firebase()
