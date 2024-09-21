import os
import numpy as np
import rasterio
from skimage import io, filters
from sklearn.decomposition import PCA, FastICA

def load_multispectral_image_bands(input_folder):
    """Load separate band images from the specified folder and combine them into a single array."""
    band_files = [f for f in os.listdir(input_folder) if f.endswith('.tif')]
    band_files.sort()  # Ensure the bands are in the correct order
    bands = [io.imread(os.path.join(input_folder, band_file)) for band_file in band_files]
    return np.stack(bands, axis=0)

def load_multispectral_image_bands_cropped(input_folder, cropDimensions):
    """Load separate band images from the specified folder, crop them, and combine them into a single array."""
    band_files = [f for f in os.listdir(input_folder) if f.endswith('.tif')]
    band_files.sort()  # Ensure the bands are in the correct order
    bands = []
    for band_file in band_files:
        single_image = io.imread(os.path.join(input_folder, band_file))
        pixel_height = len(single_image)
        pixel_width = len(single_image[0])
        start_crop_x = round(pixel_width * cropDimensions[0][0])
        start_crop_y = round(pixel_height * cropDimensions[0][1])
        end_crop_x = round(pixel_width * cropDimensions[1][0])
        end_crop_y = round(pixel_height * cropDimensions[1][1])
        cropped_image = single_image[start_crop_y:end_crop_y, start_crop_x:end_crop_x]
        bands.append(cropped_image)
    return np.stack(bands, axis=0)

def perform_pca(image):
    """Perform Principal Component Analysis (PCA) on the image."""
    pca = PCA(n_components=image.shape[0])
    return pca.fit_transform(image.reshape(image.shape[0], -1).T).T.reshape(image.shape)

def perform_ica(image):
    """Perform Independent Component Analysis (ICA) on the image."""
    ica = FastICA(n_components=image.shape[0])
    return ica.fit_transform(image.reshape(image.shape[0], -1).T).T.reshape(image.shape)

def create_image_ratio(image, band1, band2):
    """Create a ratio image using two specified bands."""
    return np.divide(image[band1], image[band2])

def apply_gaussian_blur(image, sigma=1):
    """Apply Gaussian blur to the image."""
    return filters.gaussian(image, sigma=sigma)

def perform_mnf(image):
    """Perform Minimum Noise Fraction (MNF) transformation on the image."""
    # Placeholder for MNF transformation; actual implementation may vary
    return image  # Replace with actual MNF algorithm

def save_image(image, output_folder, file_name, process_name):
    """Save the image as a TIFF with descriptive filenames."""
    # Ensure the output directory exists
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    filename_base = os.path.join(output_folder, f'{file_name}_{process_name}')

    # Check the number of dimensions in the image
    if image.ndim == 3:
        # Assuming image is in the format of [bands, height, width]
        bands, height, width = image.shape
    elif image.ndim == 2:
        # Assuming image is in the format of [height, width], add a dummy bands dimension
        height, width = image.shape
        bands = 1  # Single band
        image = image[np.newaxis, :, :]  # Add a new axis to make it 3D
    else:
        raise ValueError("Image has an unsupported number of dimensions")

    # Save the image as TIFF
    with rasterio.open(
            f'{filename_base}.tif', 'w',
            driver='GTiff',
            height=height,
            width=width,
            count=bands,
            dtype=image.dtype
        ) as dst:
        dst.write(image)

    file_path = os.path.join(output_folder, f'{file_name}_{process_name}.tif')

    new_image = {
        "name" : file_name + '_' + process_name + '.tif',
        "size" : os.path.getsize(file_path)
    }
    return new_image;

def process_image(output_folder, image, name_prefix = ""):
    if image.shape[0] < 2:
        print("Not enough bands for certain operations.")
        return

    # Process and save each type of image
    processes = [
        (name_prefix + 'PCA', perform_pca),
        (name_prefix + 'ICA', perform_ica),
        (name_prefix + 'Ratio_B1_B2', lambda img: create_image_ratio(img, 0, 1)),
        (name_prefix + 'Gaussian_Blur', lambda img: apply_gaussian_blur(img[0], sigma=2)),
        (name_prefix + 'MNF', perform_mnf)
    ]

    processed_images = []

    for process_name, func in processes:
        processed_image = func(image)
        new_image = save_image(processed_image, output_folder, 'multispectral', process_name)
        processed_images.append(new_image)

    return processed_images

def process_images(input_folder, output_folder):
    """Process all bands in the input folder as parts of a multispectral image."""
    image = load_multispectral_image_bands(input_folder)
    process_image(output_folder, image)

def process_cropped_images(input_folder, output_folder, cropDimensions, name):
    """Process all bands in the input folder as cropped parts of a multispectral image."""
    image = load_multispectral_image_bands_cropped(input_folder, cropDimensions)
    # name_prefix = ''.join(cropDimensions[0]).join(cropDimensions[1])
    process_image(output_folder, image, name)
