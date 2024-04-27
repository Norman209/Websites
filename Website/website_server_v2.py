from flask import Flask, request, send_from_directory, jsonify,redirect,render_template,send_file,make_response
from werkzeug.utils import secure_filename
import logging
log = logging.getLogger('pydrop')
import shutil
import os
import uuid
app = Flask(__name__, static_folder='public')
app.config['UPLOAD_FOLDER']='/Users/milesnorman/websites/upload_folders'
app.config["TEMPLATES_AUTO_RELOAD"] = True
upload_directory='/Users/milesnorman/websites/upload_folders'
print('starting server')


@app.route("/",methods=['GET', 'POST'])
def starting_page():
    if request.method=='POST':
        value = request.form['Task']
        print(f'chose {value}')
        return redirect(f'/{value}')
    return render_template('augment.html')


# USING FETCH API WITH JS AND PYTHON

# // let formData = new FormData(); // empty data 
# // let image_id='random id here'  // id that will be assigned to data

# // dataset = document.getElementById("folder_upload_id").files; //client's uploaded folder from html form
 
# // sample_image=dataset[0] //first image of client's uploaded folder

# // formData.append('image',sample_image) // adding image to data that will be posted to flask server
# // formData.append('image_id', image_id) //giving the data/single image an id 

# // fetch('/upload', { method: "POST",body: formData}); //posting data (single image) to flask code with '/upload' URL

# from flask import request
# @app.route('/upload') #url specified in fetch POST request
# def test():
#     if request.method=='POST':

#         image = request.files['image'] #getting the image from the post request
#         image_id=request.form['image_id'] #getting the image id
#         #BTW, to get files from a fetch form, use request.files, to get text, use request.form
#         #in this case, the text is the image id, the file is the image

#         image.save(os.path.join(image_directory, image.filename)) #saving the file/image to the webserver directory



@app.route('/download/<filename>', methods=['GET']) #<filename> is a dynamic parameter, meaning it's not a fixed value and is the text after '/download'
def download(filename):

    print('filename:',filename)
    directory = '/Users/milesnorman/websites/upload_folders' # Specify the directory where your file is stored
    
    # Return the file to the client for download
    return send_file(os.path.join(directory, filename), as_attachment=True)



@app.route('/upload', methods=['GET','POST'])
def upload():
    file = request.files['file']

    save_path = os.path.join(upload_directory, secure_filename(file.filename))
    current_chunk = int(request.form['dzchunkindex'])

    # If the file already exists it's ok if we are appending to it,
    # but not if it's new file that would overwrite the existing one
    if os.path.exists(save_path) and current_chunk == 0:
        # 400 and 500s will tell dropzone that an error occurred and show an error
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
    else:
        log.debug(f'Chunk {current_chunk + 1} of {total_chunks} '
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



    
    
