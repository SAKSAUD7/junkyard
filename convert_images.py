from PIL import Image
import os

# Convert logo.png to WebP
img = Image.open('frontend/public/logo.png')
img.save('frontend/public/logo.webp', 'WEBP', quality=85, optimize=True)
size = os.path.getsize('frontend/public/logo.webp')
print('logo.webp: ' + str(size) + ' bytes')

# Convert junkyard-aerial.png to WebP
img2 = Image.open('frontend/public/heroes/junkyard-aerial.png')
img2.save('frontend/public/heroes/junkyard-aerial.webp', 'WEBP', quality=82, optimize=True)
size2 = os.path.getsize('frontend/public/heroes/junkyard-aerial.webp')
print('junkyard-aerial.webp: ' + str(size2) + ' bytes')
