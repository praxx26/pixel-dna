import os
import shutil
import random
from pathlib import Path

def split_dataset(source_dir, dest_dir, train_ratio=0.8, val_ratio=0.1):
    """
    Splits images from a source directory containing 'real' and 'fake' folders 
    into train, val, and test splits.
    """
    source_dir = Path(source_dir)
    dest_dir = Path(dest_dir)
    
    classes = ['real', 'fake']
    
    # Create destination directories
    splits = ['train', 'val', 'test']
    for split in splits:
        for cls in classes:
            (dest_dir / split / cls).mkdir(parents=True, exist_ok=True)
            
    for cls in classes:
        cls_dir = source_dir / cls
        if not cls_dir.exists():
            print(f"Warning: Directory {cls_dir} does not exist. Skipping.")
            continue
            
        images = [f for f in os.listdir(cls_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        random.shuffle(images)
        
        num_images = len(images)
        train_end = int(num_images * train_ratio)
        val_end = train_end + int(num_images * val_ratio)
        
        train_imgs = images[:train_end]
        val_imgs = images[train_end:val_end]
        test_imgs = images[val_end:]
        
        print(f"Class '{cls}': {num_images} total -> {len(train_imgs)} train, {len(val_imgs)} val, {len(test_imgs)} test")
        
        def copy_files(file_list, split_name):
            for f in file_list:
                src = cls_dir / f
                dst = dest_dir / split_name / cls / f
                shutil.copy2(src, dst)
                
        copy_files(train_imgs, 'train')
        copy_files(val_imgs, 'val')
        copy_files(test_imgs, 'test')
        
    print("Dataset split successfully completed.")

if __name__ == "__main__":
    # Adjust these paths as needed based on where you downloaded the dataset
    SOURCE_DIRECTORY = "downloaded_data" # Change this to the actual folder where 'real' and 'fake' are initially downloaded
    DESTINATION_DIRECTORY = "dataset"
    
    # Only run if SOURCE_DIRECTORY exists
    if os.path.exists(SOURCE_DIRECTORY):
        split_dataset(SOURCE_DIRECTORY, DESTINATION_DIRECTORY)
    else:
        print(f"Please extract your downloaded images into a folder named '{SOURCE_DIRECTORY}' with 'real' and 'fake' subfolders.")
