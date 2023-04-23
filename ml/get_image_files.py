import firebase_admin
import os
import shutil
from firebase_admin import credentials, storage
from datetime import datetime, timedelta, timezone
# Initialize the Firebase Admin SDK
cred = credentials.Certificate('burgle-firebase-adminsdk-htkkm-0c3dcb20ad.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'burgle.appspot.com'
})

# Create a reference to the image files in the past 24 hours
bucket = storage.bucket()
# Calculate the past 24 hours from the current time in UTC
past_24_hours = datetime.now(timezone.utc) - timedelta(days=30)

# List all the blobs in the bucket
blobs = bucket.list_blobs()

# Filter the blobs to only include those updated in the past 24 hours
blobs = [b for b in blobs if b.updated.replace(tzinfo=timezone.utc) >= past_24_hours]

shutil.rmtree('train_images')
os.makedirs('train_images', exist_ok=True)
# Download each image file to a local file on your computer
for blob in blobs:
    signed_url = blob.generate_signed_url(expiration=timedelta(minutes=15))
    file_name = os.path.basename(blob.name)
    download_path = os.path.join('train_images', file_name)
    blob.download_to_filename(download_path)