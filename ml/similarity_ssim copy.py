import urllib.request
import cv2
import numpy as np
from skimage.metrics import structural_similarity as compare_ssim
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db, storage

# Initialize Firebase database
cred = credentials.Certificate('burgle-firebase-adminsdk-htkkm-0c3dcb20ad.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://burgle-default-rtdb.asia-southeast1.firebasedatabase.app',
    'storageBucket': 'burgle.appspot.com'
})

# Retrieve image URLs from Firebase database
ref = db.reference()
image1_url = ref.child('latestJPG').get()
image2_url = ref.child('intrusionJPG').get()

# Download images from URLs
urllib.request.urlretrieve(image1_url, 'image1.jpg')
urllib.request.urlretrieve(image2_url, 'image2.jpg')

# Calculate similarity between images using SSIM
img1 = cv2.imread('image1.jpg')
img2 = cv2.imread('image2.jpg')
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

# Apply a high-pass filter to the images
#kernel = np.array([[-1,-1,-1], [-1,7,-1], [-1,-1,-1]])
kernel = np.array([[-1, -1, -1, -1, -1],
                   [-1,  2,  2,  2, -1],
                   [-1,  2,  8,  2, -1],
                   [-1,  2,  2,  2, -1],
                   [-1, -1, -1, -1, -1]])
# kernel = np.array([[-2, -2, -2], [-2, 16, -2], [-2, -2, -2]])
filtered1 = cv2.filter2D(gray1, -1, kernel)
filtered2 = cv2.filter2D(gray2, -1, kernel)

cv2.imwrite("filtered1.jpg", filtered1)
cv2.imwrite("filtered2.jpg", filtered2)
# Compute the SSIM between the two images
similarity = compare_ssim(filtered1, filtered2, multichannel=False)

# Print similarity score
print('Similarity score: {:.2f}'.format(similarity))

# Create image with input images side by side and similarity score beneath
height, width, channels = img1.shape
image = np.zeros((height*2, width, channels), dtype=np.uint8)
image[:height, :, :] = img1
image[height:, :, :] = img2
cv2.putText(image, f'Similarity: {similarity:.2f}', (10, height+50),
            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

cv2.imwrite('similarity.jpg', image)
# Upload image to Firebase Storage
bucket = storage.bucket()
blob = bucket.blob('similarity.jpg')
blob.upload_from_filename('similarity.jpg')

# Get download URL and store in Firebase database
url = blob.generate_signed_url(expiration=300, version='v4')
ref.child('similarity_url').set(url)