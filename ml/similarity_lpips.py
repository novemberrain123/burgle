import urllib.request
import cv2
import numpy as np
from skimage.metrics import structural_similarity as compare_ssim
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db, storage
import lpips
import torch
import numpy as np
import os
import urllib

# Initialize Firebase database
cred = credentials.Certificate('burgle-firebase-adminsdk-htkkm-0c3dcb20ad.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://burgle-default-rtdb.asia-southeast1.firebasedatabase.app',
    'storageBucket': 'burgle.appspot.com'
})

# Retrieve image URLs from Firebase database
ref = db.reference()
image1_url = ref.child('intrusionJPG').get()
image2_url = ref.child('latestJPG').get()

# Download images from URLs
urllib.request.urlretrieve(image1_url, 'image1.jpg')
urllib.request.urlretrieve(image2_url, 'image2.jpg')

image1 = cv2.imread('image1.jpg')
image2 = cv2.imread('image2.jpg')

img1_tensor = lpips.im2tensor(lpips.load_image('image1.jpg'))
img2_tensor = lpips.im2tensor(lpips.load_image('image2.jpg'))

loss_fn_alex = lpips.LPIPS(net='vgg') # best forward scores
similarity = loss_fn_alex.forward(img1_tensor,img2_tensor).item()

# Print similarity score
print('Similarity score: {:.2f}'.format(1 - similarity))

# Create image with input images side by side and similarity score beneath
height, width, channels = image1.shape
image = np.zeros((height*2, width, channels), dtype=np.uint8)
image[:height, :, :] = image1
image[height:, :, :] = image2
cv2.putText(image, f'Similarity: {1 - similarity:.2f}', (10, height+50),
            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

cv2.imwrite('similarity.jpg', image)
# Upload image to Firebase Storage
bucket = storage.bucket()
blob = bucket.blob('similarity.jpg')
blob.upload_from_filename('similarity.jpg')

# Get download URL and store in Firebase database
url = blob.generate_signed_url(expiration=5000, version='v4')
ref.child('similarity_url').set(url)
ref.child('stolen').set('UNLIKELY' if similarity > 0.7 else 'LIKELY' if similarity > 0.5 else 'HIGHLY LIKELY' ) #LIKELY, UNLIKELY, HIGHLY LIKELY


