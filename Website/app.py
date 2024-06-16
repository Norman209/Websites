from flask import Flask, request, send_from_directory, jsonify,redirect,render_template,send_file,make_response,url_for
from werkzeug.utils import secure_filename
import logging
log = logging.getLogger('pydrop')
import shutil
import time
#import albumentations as A 
# albumentations takes too much time to import
import os
import uuid
import json
import fnmatch
import threading
import cv2
import pandas as pd
from PIL import Image
import numpy as np
from augmentation_functions import apply_gaussian_blur

from werkzeug import Request as r
r.max_form_parts = 50000000000000 



app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER']='/Users/milesnorman/websites/Website/upload_folders'
app.config["TEMPLATES_AUTO_RELOAD"] = True

static_folder_path = '/Users/milesnorman/websites/Website/static'
upload_directory='/Users/milesnorman/websites/Website/upload_folders'
valid_image_extensions = ('.png', '.jpg', '.jpeg', '.tiff', '.bmp')
#the keys for this dict are folder ids, and the values are the sample image's extension from the corresponding folder
dict_with_interactive_image_paths = {} #dict with image extensions that will be used for interacitve sliders
#if the value for a key (a folder id) is 'none', that means that the folder is invalid and has no images

class_info_dict = {}

space_id = 'efscsI8785'
left_par_id = 'rjrbvldbv23'      #encoding invalid characters, then decoding them when user downloads
right_par_id = 'oidfvdjlvbevo'



# @app.route("/test",methods=['GET', 'POST'])
# def starting_page():
#     if request.method=='POST':
#         value = request.form['Task']
#         print(f'chose {value}')
#         return redirect(f'/{value}')
#     return render_template('augment.html')

def delete_dir(path):
    shutil.rmtree(path,ignore_errors=True)

def find_classes(csv_file, filenames):
    # Read the CSV file into a DataFrame
    df = pd.read_csv(csv_file)
    path_to_directory = '/'.join(csv_file.split('/')[:-1])
    print('path to direc:',path_to_directory)
    # Extract the class names from the DataFrame
    class_names = df.columns[1:].tolist()  # Assuming first column is 'filename'

    result = {}
    unlabeled = []
    for filename in filenames:
        # Find the row corresponding to the given filename
        file_row = df[df['filename'] == filename]
        if len(file_row) == 0:
            print("Filename", filename, "not found.")
            result[filename] = []
            unlabeled.append(filename)
            continue

        # Extract the classes associated with the filename
        classes = file_row.iloc[0, 1:].tolist()

        # Map class indices to class names
        classes_names_associated = [class_names[i] for i, c in enumerate(classes) if c == 1]

        result[os.path.join(path_to_directory,filename)] = classes_names_associated
    unlabeled = [os.path.join(path_to_directory,filename) for filename in unlabeled]
    return [result,unlabeled]

def find_image_directories(root_dir):
    # Define common image file extensions
    image_extensions = ('*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.tiff')
    
    # List to store directories containing images
    image_dirs = []

    # Walk through directory tree
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Check if any file in the directory matches the image extensions
        for ext in image_extensions:
            if any(fnmatch.fnmatch(file, ext) for file in filenames):
                image_dirs.append(dirpath)
                break
    
    return image_dirs

def unzip(path_to_zip_file):
    zip_filename = path_to_zip_file.split('/')[-1]
    directory_to_extract_to = os.path.join(upload_directory,zip_filename[:-4])
    os.mkdir(directory_to_extract_to)
    shutil.unpack_archive(path_to_zip_file,directory_to_extract_to,'zip') #unpacking zip file
    rand_filename = random_filename()
    os.rename(path_to_zip_file,os.path.join(upload_directory,rand_filename))
    thread1 = threading.Thread(target=delete_zip_file,args=(rand_filename,))
    thread1.start()
    return directory_to_extract_to

def find_sum_of_strings(list):
    sum=''
    for i in list:
        sum+=i
    return sum



@app.route('/download/<id>', methods=['GET']) #<id> is a dynamic parameter, meaning it's not a fixed value and is the text after '/download'
def download(id):
    for dir in os.listdir(upload_directory):
        if id in dir and dir[-4:]=='.zip':
            print(id,'in',dir)
            download_file = dir
            thread3 = threading.Thread(target=delete_file,args=(f'{upload_directory}/{download_file}',))
            thread3.start()
            new_download_file_name = download_file.replace(id,'').replace(space_id,' ').replace(left_par_id,'(').replace(right_par_id,')')
            print('download file:',download_file)
            return send_file(os.path.join(upload_directory, download_file), as_attachment=True,download_name=new_download_file_name)


@app.route('/check_finished/<zip_id>', methods=['GET'])
def check_finished(zip_id):
    print('FILE PATH BEING RETURNED:',dict_with_interactive_image_paths[zip_id])
    return dict_with_interactive_image_paths[zip_id] #returns an image path

def check_if_folder_is_valid(folder_path):
    folder_name = folder_path.split('/')[-1]
    not_classes = ['train','training','valid','test','validation','testing','val',folder_name,'__MACOSX']
    train_dir_names = ['train','training']
    test_dir_names = ['test','testing']
    validation_dir_names = ['valid','validation']

    directories_with_images = find_image_directories(folder_path)
    class_paths = [i for i in directories_with_images if i.split('/')[-1].lower() not in not_classes and i.split('/')[-1]!=folder_name]
    print('class names:',[i.split('/')[-1] for i in class_paths])     
    class_images = {}
    for path in class_paths:
        images_in_path = [i for i in os.listdir(path) if i.endswith(valid_image_extensions)]
        for i,v in enumerate(images_in_path):
            images_in_path[i] = os.path.join(path,v)
    
        class_images[path] = images_in_path
    #IMPORTANT: 'class_images' IS A DICTIONARY STORING CLASS PATHS AND THEIR CORRESPONDING IMAGES
    #IT WILL STORE UNLABELED IMAGES ASWELL


    # csv format:

    # filename, class1, class2, class3, etc.
    # 000001.jpg, 0, 1, 0
    # 000007.jpg, 0, 1, 0
    # 000012.jpg, 0, 1, 0
    # 000013.jpg, 0, 1, 0
    class_images['csv_labeled_images'] = {} #csv labeled images is a dictionary containing the classes of all csv labeled images
    class_images['unlabeled_images'] = [] #unlabeled images stored here in this list (full paths)
    for dir_path in directories_with_images:
        dir_name = dir_path.split('/')[-1]
        if dir_name in not_classes and dir_name!='__MACOSX':
            filenames = os.listdir(dir_path)
            contains_csv = False
            for i in filenames:
                if i.endswith('.csv'):
                    contains_csv = True
                    break
            if contains_csv:
                for index,filename in enumerate(filenames):
                    if filename.endswith('.csv'):
                        csv_path = os.path.join(dir_path,filename)
                        csv_contents = pd.read_csv(csv_path)
                        classes = csv_contents.iloc[:,1:]
                        csv_filenames = csv_contents.iloc[:, 0]
                        image_names = [i for i in os.listdir(dir_path) if i.endswith(valid_image_extensions)]
                        class_info = find_classes(csv_path,image_names)
                        unlabeled_images = class_info[1]
                        for filepath in unlabeled_images:
                            class_images['unlabeled_images'].append(filepath)

                        class_images['csv_labeled_images'].update(class_info[0])
                        break
            else:
                #directory contains unlabeled images
                unlabeled_image_names = [i for i in os.listdir(dir_path) if i.endswith(valid_image_extensions)]
                unlabeled_image_paths = [os.path.join(dir_path,i) for i in unlabeled_image_names]
                for i in unlabeled_image_paths:
                    class_images['unlabeled_images'].append(i)

    #class images should also include unlabeled

    #print('unlabeled:',class_images['unlabeled_images'])
    #print('total unlabeled:',len(class_images['unlabeled_images']))
    print('total labeled with csv:',len(class_images['csv_labeled_images']))
    #print('unlabeled:',len(class_images['unlabeled_images']))
    return class_images
    


def make_interactive_images(path,id): #TODO:
    for absolute_path,dirs, files in os.walk(path):
        for filename in files:
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
                img_path = os.path.join(absolute_path,filename)
                if '__MACOSX' not in img_path:
                    #check if folder has images, if not, return none.
                    filename = img_path.split('/')[-1]
                    interactive_images_path = os.path.join(static_folder_path,id)
                    os.mkdir(interactive_images_path) #making a folder for the users interactive images
                    blur_path = os.path.join(interactive_images_path,'blur')
                    rotate_90_path = os.path.join(interactive_images_path,'rotate_90')
                    crop_path = os.path.join(interactive_images_path,'crop')
                    grayscale_path = os.path.join(interactive_images_path,'grayscale')
                    rotate_path = os.path.join(interactive_images_path,'rotate')
                    flip_path = os.path.join(interactive_images_path,'flip')
                    os.mkdir(blur_path)
                    os.mkdir(rotate_90_path)
                    os.mkdir(crop_path)
                    os.mkdir(grayscale_path)
                    os.mkdir(rotate_path)
                    os.mkdir(flip_path)
                    for ext in valid_image_extensions:
                        if img_path.endswith(ext):
                            path_to_sample_image = os.path.join(interactive_images_path,'sample'+ext)
                            shutil.copyfile(img_path,path_to_sample_image)
                            break
                    
                    #First, we will generate the guassian blur images.
                    blur_decimal_range = np.arange(0.1, 25.1, 0.1) 

                    for sigma in blur_decimal_range:
                        print('sigma:',sigma)
                        for ext in valid_image_extensions:
                            if path_to_sample_image.endswith(ext):
                                output_path = os.path.join(blur_path,str(round(sigma,1)))+ext
                                apply_gaussian_blur(path_to_sample_image,round(sigma,1),output_path)
                                break
                    




                    return os.path.join('static',id,filename)

    # deleting folder since it has no images
    thread6 = threading.Thread(target=delete_dir,args=(path,))
    thread6.start()
    return 'none'


def find_dirs_of_filepath(filepath,id):
    
    filepath = filepath.split('/')
    filepath[0]+=id
    filepath = '/'.join(filepath)
    filepath = os.path.join(upload_directory, filepath)
    dir_names_and_filename = filepath.split('/')
    filename = dir_names_and_filename[-1]
    dir_names_and_filename.pop(-1)
    dir_names_and_filename.pop(0)
    for i,v in enumerate(dir_names_and_filename):
        dir_names_and_filename[i] = '/'+dir_names_and_filename[i] 
        directory_path = find_sum_of_strings(dir_names_and_filename[:i+1])
        if not os.path.exists(directory_path):
            os.mkdir(directory_path)
    file_path = find_sum_of_strings(dir_names_and_filename)+'/'+filename
    return file_path

@app.route('/send_folder/<folder_id>/<last_upload>', methods=['post'])
def receive_folder_files(folder_id,last_upload):
    dict_with_interactive_image_paths[folder_id] = 'unfinished'
    files = request.files.getlist('file')
    total_files = len(files)
    file_saved_count = 0
    directory_to_upload = None
    for file in files:  
        filepath = find_dirs_of_filepath(file.filename,folder_id)
        if not os.path.exists(filepath): 
            file_saved_count+=1
            file.save(filepath)
            #print(f'saved {file_saved_count} files out of {total_files}')
        else:
            print('file already exists')
    print('last upload:',last_upload)
    # finding folder path, and checking if it has images
    if folder_id not in os.listdir(static_folder_path) and last_upload=='true':
        for folder_name in os.listdir(upload_directory):
            if folder_id in folder_name:
                directory_to_upload = os.path.join(upload_directory,folder_name)
                img_path = make_interactive_images(directory_to_upload,folder_id)

                if img_path!='none':
                    class_data = check_if_folder_is_valid(directory_to_upload)
                    class_info_dict[folder_id] = class_data
                    for i in valid_image_extensions:
                        if img_path.endswith(i):
                            img_extension = i
                    dict_with_interactive_image_paths[folder_id] = img_extension
                else:
                    print('no images in dataset')
                    dict_with_interactive_image_paths[folder_id] = 'none'
                return dict_with_interactive_image_paths[folder_id]
    print('keys:',dict_with_interactive_image_paths.keys())
    return dict_with_interactive_image_paths[folder_id]


def delete_file(filename):
    time.sleep(.5)
    os.remove(filename)

@app.route('/upload', methods=['GET','POST'])
def upload():
 
    file = request.files['file']
    file_id = request.form['id']
    dict_with_interactive_image_paths[file_id] = 'upload not finished'
    file.filename = file.filename.replace(' ',space_id).replace('(',left_par_id).replace(')',right_par_id)

    save_path = os.path.join(upload_directory, file_id+secure_filename(file.filename))

    current_chunk = int(request.form['dzchunkindex'])
    # If the file already exists it's ok if we are appending to it,
    # but not if it's new file that would overwrite the existing one
    if os.path.exists(save_path) and current_chunk == 0:
        # 400 and 500s will tell dsropzone that an error occurred and show an error
        return make_response(('File already exists', 400))

    try:
        with open(save_path, 'ab') as f:
            f.seek(int(request.form['dzchunkbyteoffset']))
            f.write(file.stream.read())
    except OSError:
        # log.exception will include the traceback so we can see what's wrong 
        log.exception('Could not write to file')
        return make_response(("Not sure why," " but we couldn't write the file to disk", 500))

    total_chunks = int(request.form['dztotalchunkcount'])
    print(f'current chunks to total chunks: {current_chunk}/{total_chunks}')
    if current_chunk + 1 == total_chunks:

        # This was the last chunk, the file should be complete and the size we expect
        if os.path.getsize(save_path) != int(request.form['dztotalfilesize']):
            log.error(f"File {file.filename} was completed, "
                      f"but has a size mismatch."
                      f"Was {os.path.getsize(save_path)} but we"
                      f" expected {request.form['dztotalfilesize']} ")
            return make_response(('Size mismatch', 500))
        else:
            print(f'File {file.filename} has been uploaded successfully')
            directory_to_extract_to = unzip(save_path)
            uploaded_directory = directory_to_extract_to
            path = uploaded_directory
            img_path = make_interactive_images(path,file_id)
            if img_path!='none':
                class_info = check_if_folder_is_valid(path)
                class_info_dict[file_id] = class_info
                for i in valid_image_extensions:
                    if img_path.endswith(i):
                        img_extension = i
                dict_with_interactive_image_paths[file_id] = img_extension #s
            else:
                dict_with_interactive_image_paths[file_id] = 'none'
            #return img_path
            print('RETURNING',dict_with_interactive_image_paths[file_id])
            return make_response(('Upload success', 200))
            
            #unzip zip file here

    else:    
        log.debug(f'Chunk {current_chunk + 1} of {total_chunks}'
                  f'for file {file.filename} complete')
    
    return make_response(('Upload success', 200))
    #make_response(("Chunk upload successful", 200))#TODO: return image here 

def random_filename():
    rand_filename = str(uuid.uuid4())+'.zip'
    print(rand_filename)
    return rand_filename
def delete_zip_file(filename):
    os.remove(os.path.join(upload_directory,filename))

@app.route('/augment/<dataset_id>',methods=['POST','GET']) 
def augment(dataset_id):
    class_data = class_info_dict[dataset_id]
    augmentation_data = json.loads(request.form['aug_data'])
    folders = os.listdir(upload_directory)
    for folder_name in folders: # 
        if dataset_id in folder_name and '.zip' not in folder_name:
            full_dir_path = os.path.join(upload_directory,folder_name)
            output_file_path = os.path.join(upload_directory,folder_name)

            # folder to augment is full_dir_path
            #TODO: augment folder here

            print('augmenting',folder_name)
            shutil.make_archive(full_dir_path,'zip',output_file_path)
            thread4 = threading.Thread(target=delete_dir,args=(full_dir_path,))
            thread4.start()
            interactive_images_folder = os.path.join(static_folder_path,dataset_id)
            thread5 = threading.Thread(target=delete_dir,args=(interactive_images_folder,))
            thread5.start()
            break
    return 'augment succecfull' 



@app.route('/',methods=['POST','GET']) 
def Classification():
    return render_template('Classification.html')



@app.route('/Object_detection',methods=['POST','GET'])
def Object_detection():
    return render_template('Object_detection.html')
 
@app.route('/Segmentation',methods=['POST','GET'])
def Segmentation():
    return render_template('Segmentation.html')
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)#debug=True