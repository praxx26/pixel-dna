import os
import shutil
import random
from pathlib import Path

def create_subset(source_dir, dest_dir, samples_per_class=500):
    """
    Creates a smaller subset of the massive dataset so training is fast.
    """
    source_dir = Path(source_dir)
    dest_dir = Path(dest_dir)
    
    splits = ['train', 'test']
    classes = ['REAL', 'FAKE']
    
    # Create destination directories
    for split in splits:
        for cls in classes:
            (dest_dir / split / cls).mkdir(parents=True, exist_ok=True)
            
    for split in splits:
        for cls in classes:
            src_path = source_dir / split / cls
            if not src_path.exists():
                print(f"Warning: Directory {src_path} does not exist.")
                continue
                
            images = [f for f in os.listdir(src_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            random.shuffle(images)
            
            # Select subset
            num_samples = min(samples_per_class, len(images))
            # Test split can be smaller, e.g. 1000 images
            if split == 'test':
                num_samples = min(1000, len(images))
                
            subset_images = images[:num_samples]
            
            print(f"Copying {num_samples} images from {split}/{cls}...")
            
            for f in subset_images:
                src_file = src_path / f
                dst_file = dest_dir / split / cls / f
                shutil.copy2(src_file, dst_file)
                
    print(f"Subset creation complete in {dest_dir}")

if __name__ == "__main__":
    SOURCE_DIRECTORY = "dataset"
    DESTINATION_DIRECTORY = "dataset_subset"
    
    if os.path.exists(SOURCE_DIRECTORY):
        # We increase samples_per_class to 5000 to improve model accuracy.
        create_subset(SOURCE_DIRECTORY, DESTINATION_DIRECTORY, samples_per_class=5000)
    else:
        print(f"Source directory '{SOURCE_DIRECTORY}' not found.")
