from flask import Flask, request, send_from_directory, jsonify,redirect,render_template
import os
import uuid

app = Flask(__name__, static_folder='public')
#this is a comment
@app.route("/",methods=['GET', 'POST'])
def starting_page():
    if request.method=='POST':
        value = request.form['Task']
        print(f'chose {value}')
        return redirect(f'/{value}')
    return render_template('augment.html')

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
    app.run(debug=True)



    