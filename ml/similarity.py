import urllib.request
import cv2
import numpy as np
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# Initialize Firebase database
cred = credentials.Certificate('burgle-firebase-adminsdk-htkkm-0c3dcb20ad.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://burgle-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# Retrieve image URLs from Firebase database
ref = db.reference()
image1_url = ref.child('latestJPG').get()
image2_url = ref.child('intrusionJPG').get()

# Download images from URLs
urllib.request.urlretrieve(image1_url, 'image1.jpg')
urllib.request.urlretrieve(image2_url, 'image2.jpg')

# Calculate similarity between images using NCC
image1 = cv2.imread('image1.jpg', cv2.IMREAD_GRAYSCALE)
image2 = cv2.imread('image2.jpg', cv2.IMREAD_GRAYSCALE)
result = cv2.matchTemplate(image1, image2, cv2.TM_CCORR_NORMED)
similarity = np.max(result)

# Print similarity score
print('Similarity score: {:.2f}'.format(similarity))