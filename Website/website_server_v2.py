from flask import Flask, request, send_from_directory, jsonify,redirect,render_template,send_file
import shutil
import os
import uuid
app = Flask(__name__, static_folder='public')
app.config['UPLOAD_FOLDER']='/Users/milesnorman/websites/upload_folders'
app.config["TEMPLATES_AUTO_RELOAD"] = True
print('starting server')


@app.route("/",methods=['GET', 'POST'])
def starting_page():
    if request.method=='POST':
        value = request.form['Task']
        print(f'chose {value}')
        return redirect(f'/{value}')
    return render_template('augment.html')


#USING FETCH API WITH JS AND PYTHON

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

    print('filename:',filename) #in this case, this statement will output 'name_of_file_you_want_to_download' when the anchor tag is clicked on

    directory = '/Users/milesnorman/websites/upload_folders' # Specify the directory where your file is stored
    
    # Return the file to the client for download
    return send_file(os.path.join(directory, filename), as_attachment=True)


@app.route('/Classification',methods=['POST','GET']) 
def Classification():
    if request.method=='POST':
        #print('is this null?',request.files['hello'])
        #value=request.form['folder']
        #f = request.files['folder']  # Handle multiple files
        image = request.files['image'] # Get list of files 
        dataset_id=request.form['id']
        keys=request.form.keys()
        if 'start_id' in keys:
            if not os.path.exists(f'/Users/milesnorman/websites/upload_folders/{dataset_id}'):
                upload_folder_path=f'/Users/milesnorman/websites/upload_folders/{dataset_id}'
                os.mkdir(upload_folder_path)
        image.save(os.path.join(f'/Users/milesnorman/websites/upload_folders/{dataset_id}', image.filename))
        if 'end_id' in keys:
            #augment dataset then zip it
            print('ZIPPING DATASET...')
            shutil.make_archive(f'/Users/milesnorman/websites/upload_folders/{dataset_id}', 'zip', dataset_id)
            print('DONE ZIPPING',dataset_id)
        #print('saved image successfully')
        #print('files:',files)
        #current_chunk = int(request.form['dzchunkindex'])
        #print('current chunk:',current_chunk)
        # print('stream:',f)
        # for key in f.keys():
        #     for value in f.getlist(key):
        #         print(key,":",value)
        if 'end_id' in keys:
            return render_template('Classification.html') #test='test'
        else:
            return render_template('Classification.html')
    else:
        return render_template('Classification.html')


@app.route('/Object_detection',methods=['POST','GET'])
def Object_detection():
    return render_template('Object_detection.html')
 
@app.route('/Segmentation',methods=['POST','GET'])
def Segmentation():
    return render_template('Segmentation.html')
    
if __name__ == '__main__':
    app.run(debug=True)#debug=True



    
    
