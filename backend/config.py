# config.py
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from the .env file

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')  # Use DATABASE_URL here
    SQLALCHEMY_TRACK_MODIFICATIONS = False
