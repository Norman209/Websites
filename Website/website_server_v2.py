from flask import Flask, request, send_from_directory, jsonify,redirect,render_template,send_file,make_response,url_for
from werkzeug.utils import secure_filename
import logging
log = logging.getLogger('pydrop')
import shutil
import time
import os
import uuid
from threading import Thread

app = Flask(__name__, static_folder='public')
app.config['UPLOAD_FOLDER']='/Users/milesnorman/websites/upload_folders'
app.config["TEMPLATES_AUTO_RELOAD"] = True
upload_directory='/Users/milesnorman/websites/upload_folders'

space_id = 'efscsI8785'
left_par_id = 'rjrbvldbv23'      #encoding invalid characters, then decoding them when user downloads
right_par_id = 'oidfvdjlvbevo'
txt_id = 'mnhshgibsbduir'

@app.route("/",methods=['GET', 'POST'])
def starting_page():
    if request.method=='POST':
        value = request.form['Task']
        print(f'chose {value}')
        return redirect(f'/{value}')
    return render_template('augment.html')


wait_augmenting_dict = {}


#TODO: add background task that deletes files that user has already downloaded, and hide download button
@app.route('/download/<id>', methods=['GET']) #<id> is a dynamic parameter, meaning it's not a fixed value and is the text after '/download'
def download(id):
    for dir in os.listdir(upload_directory):
        if id in dir:
            print(id,'in',dir)
            download_file = dir
    if download_file is not None:
        new_download_file_name = download_file.replace(id,'').replace(space_id,' ').replace(left_par_id,'(').replace(right_par_id,')')
        return send_file(os.path.join(upload_directory, download_file), as_attachment=True,download_name=new_download_file_name)


@app.route('/check_finished/<zip_id>', methods=['GET'])
def check_finished(zip_id):
    print(wait_augmenting_dict[zip_id])
    return wait_augmenting_dict[zip_id]
        

@app.route('/upload', methods=['GET','POST'])
def upload():

    file = request.files['file']
    file_id = request.form['id']
    wait_augmenting_dict[file_id] = 'false'
    file.filename = file.filename.replace(' ',space_id).replace('(',left_par_id).replace(')',right_par_id)

    save_path = os.path.join(upload_directory, secure_filename(file.filename))

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
            log.info(f'File {file.filename} has been uploaded successfully')

            source=f'{upload_directory}/{file.filename}'
            dest = f'{upload_directory}/{file_id}{file.filename}'
            os.rename(source,dest)
             #TODO: augment dataset here

            wait_augmenting_dict[file_id] = 'true'


    else: 
        log.debug(f'Chunk {current_chunk + 1} of {total_chunks}'
                  f'for file {file.filename} complete')

    return make_response(("Chunk upload successful", 200))




@app.route('/Classification',methods=['POST','GET']) 
def Classification():
    return render_template('Classification.html')

@app.route('/Object_detection',methods=['POST','GET'])
def Object_detection():
    return render_template('Object_detection.html')
 
@app.route('/Segmentation',methods=['POST','GET'])
def Segmentation():
    return render_template('Segmentation.html')
    
if __name__ == '__main__':
    app.run(debug=True)#debug=True
