import cv2

# Load the images
img1 = cv2.imread('image1.jpg')
img2 = cv2.imread('image2.jpg')

# Convert the images to grayscale
gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

# Compute the average intensity of the pixels in each image
avg_intensity1 = cv2.mean(gray1)[0]
avg_intensity2 = cv2.mean(gray2)[0]

# Compute the scaling factor
scale_factor = 1.5 * avg_intensity2 / avg_intensity1

# Apply the scaling factor to image1
adjusted_img1 = cv2.convertScaleAbs(img1, alpha=scale_factor, beta=0)

# Save the adjusted image
cv2.imwrite('adjusted_image1.jpg', adjusted_img1)