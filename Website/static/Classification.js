
console.log(parseFloat(5).toFixed(1))
let file_id = "id" + Math.random().toString(16).slice(2);
let input_ids = ['Flip_check_box', '90° rotate_check_box', 'Crop_checkbox', 'grayscale_checkbox', 'Rotate_checkbox', 'blur_checkbox', 'Dataset Expansion Factor', 'grayscale_preprocess', 'resize_preprocess', 'submit'];
let sample_image_extension = 'none';
console.log('JAVASCRIPT STARTED');
let default_upload_option = 'zip'
function chunkDictionary(dict, chunkSize) {
    // Convert object to array of key-value pairs
    const entries = Object.entries(dict);

    // Initialize an empty array to store the chunks
    const chunks = [];

    // Iterate over the entries array and group into chunks
    for (let i = 0; i < entries.length; i += chunkSize) {
        // Slice the entries array to get a chunk of size 'chunkSize'
        const chunk = entries.slice(i, i + chunkSize);

        // Convert the chunk back to an object
        const chunkObject = Object.fromEntries(chunk);

        // Push the chunk object to the chunks array
        chunks.push(chunkObject);
    }

    return chunks;
}

function close_download_tag() {
    let download_href = document.getElementById('download_tag');
    download_href.innerText = ''
    file_id = "id" + Math.random().toString(16).slice(2);
    //download_href.href = ''
    document.getElementById('dropzone_buttons').style.display = 'block';
    document.getElementById('augmentation').style.opacity = '25%';
    document.getElementById('Pre-Proccessing').style.opacity = '25%';
}



async function log_file_paths() {
    document.getElementById('submit_dropzone').style.display = 'none';
    document.getElementById('select_folder').style.display = 'none';
    let files = await document.getElementById('design').files
    let batch_size = 250;
    let chunks = chunkDictionary(files, batch_size)
    let num_chunks = chunks.length;
    responses = [];
    let last_upload = 'false';
    for (i = 0; i < chunks.length; i++) {
        console.log('i:',i,'chunks length:',chunks.length);
        last_upload = String((i+1)===chunks.length);
        let formData = new FormData();
        let chunk = chunks[i];
        let starting_index = 0;
        if (i > 0) {
            starting_index = parseInt(Object.keys(chunks[i - 1])[Object.keys(chunks[i - 1]).length - 1]) + 1;
        }
        //console.log('starting index:',Object.keys(chunks[i-1])[Object.keys(chunk).length-1])
        let ending_index = Object.keys(chunk)[Object.keys(chunk).length - 1];
        if (!(starting_index === ending_index)) {
            for (g = starting_index; g <= ending_index; g++) {
                formData.append('file', chunk[g]);
            }
        }
        else {
            formData.append('file', chunk[starting_index]);
        }
        let aug_data = collect_aug_data();
        formData.append('augmentations', aug_data);
        console.log('waiting for chunk ' + String(i + 1) + ' out of ' + num_chunks);
        await fetch('/send_folder/' + file_id+'/'+last_upload, { body: formData, method: 'post' }).then(response => {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json().then(data => {
                    let response_text_from_server = JSON.stringify(data);
                    console.log('response:json ', response_text_from_server);
                    responses.push(response_text_from_server)
                });
            } else {
                return response.text().then(response_text_from_server => {
                    console.log('response: text', response_text_from_server);
                    responses.push(response_text_from_server);
                });
            }
        });
        let progress = (i+1) / num_chunks * 100;
        document.getElementById('dataset_upload_progress').value = progress;
        // if (response_text_from_server !== 'none') {
        //     console.log(response_text_from_server,'download')
        //     document.getElementById('test_image').src = response_text_from_server;
        // }

    }
    console.log('finished');
    let valid_return_count = 0;
    console.log('responses:',responses)
    for (i = 0; i < responses.length; i++) {
        let response = responses[i];
        if (response.includes('.')) {
            console.log('i:',i)
            valid_return_count += 1;
            document.getElementById('dataset_upload_progress').value = 100
            document.getElementById('dropzone_buttons').style.display = 'none';
            document.getElementById('design').value = null;
            sample_image_extension = response;
            enable_inputs();
            console.log('responses[i]:',sample_image_extension);
            //document.getElementById('test_image').src = responses[i];
            break;
        }
    }
    if (valid_return_count === 0) {
        console.log('no images found')
        alert('no images found in dataset')
        document.getElementById('dropzone_buttons').style.display = 'block';
        document.getElementById('upload_progress').style.display = 'none';
        document.getElementById('zip_upload_buttons').style.display = 'block';
        document.getElementById('submit_dropzone').style.display = 'block';

        document.getElementById('select_folder').style.display = 'block';
        set_zip_or_folder_upload();



    }
}

function collect_aug_data() {
    aug_list = ['hello', 'miles'];
    augs_checkboxes = ['blur_checkbox', "90° rotate_check_box", 'Crop_checkbox', 'Rotate_checkbox', 'blur_checkbox']
    let flip_checked = document.getElementById('blur_checkbox').checked;//check if blur is checked or not
    let rotation_90_checked = document.getElementById("90° rotate_check_box").checked;
    let crop_checked = document.getElementById('Crop_checkbox').checked;
    let rotate_checked = document.getElementById('Rotate_checkbox').checked;
    let blur_checked = document.getElementById('blur_checkbox').checked;
    if (flip_checked) {
        aug_list.push(['flip']) //items in order: vertically flipped, horizontally flipped, vertical prob, horizontal prob
        vertically_flipped = document.getElementById('vertical_flip').checked;
        horizontally_flipped = document.getElementById('horizontal_flip').checked;
        aug_list[-1].push(vertically_flipped)
        aug_list[-1].push(horizontally_flipped)
    }
    if (rotation_90_checked) {
        aug_list.push(['90_rotate']);
    }
    if (crop_checked) {
        aug_list.push(['crop']);
    }
    if (rotate_checked) {
        aug_list.push(['rotate']);
    }
    if (blur_checked) {
        aug_list.push(['blur']);
    }
    //TODO: return form data instead of list
    return JSON.stringify(aug_list);
}
pop_up_ids = ['rotate_pop_up', 'blur_pop_up', 'Flip_pop_up', '90_rotate_popup', 'crop_pop_up', 'grayscale_popup']
//blur_click_checkbox  flip_click_checkbox verticalflip_click_checkbox horizontalflip_click_checkbox rotate_90_click_checkbox crop_click_checkbox
class display_popups {
    rotate_click_checkbox() {
        let pop_up = document.getElementById('rotate_pop_up');
        let check_box = document.getElementById('Rotate_checkbox');
        if (check_box.checked == true) {
            pop_up.style.display = 'block';
            console.log('checked checkbox');
        }
        if (check_box.checked == false) {
            pop_up.style.display = 'none';
            console.log('unchecked checkbox');
        }
    }
    blur_click_checkbox() {
        let pop_up = document.getElementById('blur_pop_up')
        let check_box = document.getElementById('blur_checkbox')
        if (check_box.checked == true) {
            pop_up.style.display = 'block';
            console.log('checked checkbox');
        }
        if (check_box.checked == false) {
            pop_up.style.display = 'none';
            console.log('unchecked checkbox');
        }
    }
    flip_click_checkbox() {
        console.log('Flip pop up method CALLED')
        let flip_pop_up = document.getElementById('Flip_pop_up');
        if (document.getElementById('Flip_check_box').checked == true) {
            flip_pop_up.style.display = 'block';
            console.log('checked checkbox')
        }
        if (document.getElementById('Flip_check_box').checked == false) {
            flip_pop_up.style.display = 'none';
            console.log('unchecked checkbox')
        }

    }
    verticalflip_click_checkbox() {
        let vertical_flip_checkbox = document.getElementById('vertical_flip');
        let pop_up = document.getElementById('vertical_flip_popup')
        if (vertical_flip_checkbox.checked == true) {
            pop_up.style.display = 'block';
        }
        else {
            pop_up.style.display = 'none';
        }
    }
    horizontalflip_click_checkbox() {
        let horizontal_flip_checkbox = document.getElementById('horizontal_flip');
        let pop_up = document.getElementById('horizontal_flip_popup')
        if (horizontal_flip_checkbox.checked == true) {
            pop_up.style.display = 'block';
        }
        else {
            pop_up.style.display = 'none';
        }


    }

    rotate_90_click_checkbox() {
        let rotate_90_box = document.getElementById('90° rotate_check_box')
        let rotate_90_pop_up = document.getElementById('90_rotate_popup')
        if (rotate_90_box.checked == true) {
            rotate_90_pop_up.style.display = 'block';
            console.log('checked checkbox')
        }
        if (rotate_90_box.checked == false) {
            rotate_90_pop_up.style.display = 'none';
            console.log('unchecked checkbox')
        }
    }

    crop_click_checkbox() {
        let pop_up = document.getElementById('crop_pop_up')
        let check_box = document.getElementById('Crop_checkbox')
        if (check_box.checked == true) {
            console.log(pop_up.style.display)
            pop_up.style.cssText = "";
            console.log('checked checkbox')
        }
        if (check_box.checked == false) {
            // pop_up.style.display = "position: absolute; left: -1000px";
            console.log(pop_up.style.display)
            // pop_up.style.position='absolute';
            // pop_up.style.left='-1000px';
            pop_up.style.display = 'none';
            console.log('unchecked checkbox')
        }
    }
    grayscale_click_checkbox() {
        let pop_up = document.getElementById('grayscale_popup')
        let check_box = document.getElementById('grayscale_checkbox')
        if (check_box.checked == true) {
            console.log(pop_up.style.display)
            pop_up.style.cssText = "";
            console.log('checked checkbox')
        }
        if (check_box.checked == false) {
            // pop_up.style.display = "position: absolute; left: -1000px";
            console.log(pop_up.style.display)
            // pop_up.style.position='absolute';
            // pop_up.style.left='-1000px';
            pop_up.style.display = 'none';
            console.log('unchecked checkbox')
        }
    }


}
let display_popups_methods = new display_popups();

function reset_inputs() {
    for (i = 0; i < input_ids.length; i++) {
        //children[i].disabled = true;
        document.getElementById(input_ids[i]).checked = false;
    }
    for (i = 0; i < pop_up_ids.length; i++) {
        let popup_id = pop_up_ids[i];
        document.getElementById(popup_id).style.display = 'none';
    }
}

function disable_inputs() {
    reset_inputs();
    for (i = 0; i < input_ids.length; i++) {
        //children[i].disabled = true;
        let input = document.getElementById(input_ids[i]);
        console.log(input_ids[i]);
        input.disabled = true;
        document.getElementById('augmentation').style.opacity = '25%';
        document.getElementById('Pre-Proccessing').style.opacity = '25%';
        document.getElementById('submit_dropzone').style.display = 'block';
        document.getElementById('select_folder').style.display = 'block';
    }
}




function enable_inputs() {
    reset_inputs();
    document.getElementById('dataset_upload_progress').value = 0
    //upload_progress
    document.getElementById('upload_progress').style.display = 'none';
    document.getElementById('dropzone_buttons').style.display = 'none';
    for (i = 0; i < input_ids.length; i++) {
        //children[i].disabled = true;
        document.getElementById(input_ids[i]).disabled = false;
        document.getElementById('augmentation').style.opacity = '100%';
        document.getElementById('Pre-Proccessing').style.opacity = '100%';
        document.getElementById('dropzone_buttons').style.display = 'none';
    }
    let blur_slider = document.getElementById('blur_limit')
    console.log('img extension:',sample_image_extension);
    document.getElementById('blur_sample_image').src = 'static/'+file_id+'/'+'blur'+'/'+String((Number(blur_slider.value)).toFixed(1))+sample_image_extension
    document.getElementById('normal_sample_image').src = 'static/'+file_id+'/'+'sample'+sample_image_extension
    document.getElementById('blur_limit_caption').innerText = String(blur_slider.value)+'px'
    document.getElementById('show_blur_limit').innerText = blur_slider.value
    console.log('normal src:',document.getElementById('normal_sample_image').src)
    console.log('sample src:',document.getElementById('blur_sample_image').src)

}


class range_input_scripts {

    update_probabilities() {
        let sliders = ['Rotate_limit', 'blur_limit', 'grayscale_probability'];
        let i = 0
        while (i < sliders.length) {
            console.log(sliders[i]);
            let slider = document.getElementById(sliders[i]);
            let show_slider = document.getElementById(`show_${sliders[i]}`)
            show_slider.innerText = slider.value
            if(sliders[i]==='blur_limit'){
                document.getElementById('blur_sample_image').src = 'static/'+file_id+'/'+'blur'+'/'+String((Number(slider.value)).toFixed(1))+sample_image_extension
                document.getElementById('blur_limit_caption').innerText = String(slider.value)+'px'
            }
            i++
        }
    }
}
let data1;
async function submit_everything() {
    disable_inputs();
    alert("Augmenting uploaded dataset now...");

    let aug_form_data = collect_aug_data();
    let formData = new FormData();
    formData.append('aug_data', aug_form_data)
    //TODO: method here to call augmentation for specific dataset id and send over augmentation data
    //ex. augment_dataset(dataset_id,augmentation_form_data);
    //once dataset is finished augmenting
    await fetch('/augment/' + file_id, { body: formData, method: 'post' }).then(response => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(data => {
                data1 = JSON.stringify(data);
            });
        } else {
            return response.text().then(text => {
                console.log('text:', text)
            });
        }
    });
    document.getElementById('download_tag').innerText = 'click here to download augmented dataset';
    document.getElementById('download_tag').href = '/download/' + file_id;
}


class copy_paste_code_scripts {
    copy_and_paste() {
        let copy_text = document.getElementById('code_block'); // id of the textbox
        copy_text.select();
        navigator.clipboard.writeText(copy_text.value);
        //document.execCommand("copy");
        alert('copy and pasted augmentation code');
    }



    // show_copy_and_paste_checkbox() {
    //     /*let aug_string = "import albumentations as A\n" + "import cv2\n" +
    //          "transform = A.Compose([\n" + "A.RandomCrop(width=256, height=256),\n" +
    //          "A.HorizontalFlip(p=0.5),\n" +
    //          "A.RandomBrightnessContrast(p=0.2)])\n";*/
    //     let check_box_element = document.getElementById('copy_paste_div');
    //     check_box_element.style.display = 'block';
    //     let text_box = document.getElementById('code_block');
    //     text_box.value = 'test';
    //     file_id = "id" + Math.random().toString(16).slice(2);
    //     // Access Dropzone instance
    //     close_download_tag();
    //     var dropzone = Dropzone.forElement('#dropper');
    //     // dropzone.processQueue();
    //     //dropzone.removeAllFiles(true);
    //     // sending over
    // }
}

let copy_paste_code_methods = new copy_paste_code_scripts();
let range_input_methods = new range_input_scripts();
function check_if_image(data) {
    let valid_extensions = ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
    for (i = 0; i < valid_extensions.length; i++) {
        if (data.includes(valid_extensions[i])) {
            return true;
        }
    }
    return false;
}


Dropzone.options.dropper = {
    paramName: 'file',
    autoProcessQueue: false,
    chunking: true,
    forceChunking: true,
    url: '/upload',
    autoDiscover: true,
    timeout: 1.8e+6,//30 minute timeout
    init: function () {
        // this.hiddenFileInput.setAttribute("webkitdirectory", true);
        this.on("queuecomplete", async function () {
            this.removeAllFiles(true);
            console.log('file id:', file_id);
            let data1 = 'test';
            //wait for upload to finish, then enable inputs (augmentation options)
            while (data1 !== 'none' && !(data1.includes('.'))) {
                console.log('checking if finished...')
                await fetch('/check_finished/' + file_id).then(response => {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") == -1) {
                        return response.text().then(text => {
                            console.log('response:', text)
                            data1 = text;
                        });
                    }
                });
            }
            if (data1 === 'none') {
                console.log('no images found. invalid dataset')
                document.getElementById('submit_dropzone').style.display = 'block';
                alert('dataset invalid or no images found')
                file_id = "id" + Math.random().toString(16).slice(2);
                
            }
            else {
                console.log('dataset uploaded successfully, valid')
                sample_image_extension = data1;
                enable_inputs();
                document.getElementById('dropzone_buttons').style.display = 'none';
                //document.getElementById('test_image').src = data1
            }

        });
        this.on("sending", function (file, xhr, formData) {
            // Add parameters to be sent with every chunk request
            formData.append('id', file_id);
            console.log('sent chunk')
        });
    },

    maxFilesize: 100 * 1e+3, // MB 
    chunkSize: (1e+7), // bytes
    acceptedFiles: '.zip',
    maxFiles: 1,
    parallelUploads: 1,
    maxfilesexceeded: function (file) {
        this.removeAllFiles();
        this.addFile(file);
    }
}
function set_zip_or_folder_upload() {
    file_id = "id" + Math.random().toString(16).slice(2);
    var dropzoneElement = document.getElementById('dropper');
    Dropzone.forElement('#dropper').removeAllFiles(true);
    let zip_option = document.getElementById('zip');
    let folder_option = document.getElementById("folder");
    if (zip_option.checked) {
        document.getElementById('design').value = null;
        console.log('doing zip uploads');
        default_upload_option = 'zip'
        document.getElementById('folder_upload_buttons').style.display = 'none';
        document.getElementById('zip_upload_buttons').style.display = 'block';
    }
    if (folder_option.checked) {
        document.getElementById('design').value = null;
        console.log('doing folder uploads');
        default_upload_option = 'folder'
        document.getElementById('folder_upload_buttons').style.display = 'block';
        document.getElementById('zip_upload_buttons').style.display = 'none';
    }
}


function send_dataset() {
    //TODO: only do this if there is a zip file in dropzone
    if (default_upload_option === 'zip') {
        var dropzone = Dropzone.forElement('#dropper');
        if (dropzone.getQueuedFiles().length > 0) {
            document.getElementById('submit_dropzone').style.display = 'none';
            document.getElementById('augmentation').style.opacity = '25%';
            document.getElementById('Pre-Proccessing').style.opacity = '25%';
            dropzone.processQueue();
        }
    }

    else {
        if (document.getElementById('design').files.length > 0) {
            document.getElementById('upload_progress').style.display = 'block';
            document.getElementById('dropzone_buttons').style.display = 'none';
            log_file_paths();
        }
    }
    //TODO:add folder uploads by sending over individual files with paths instead of zip files
}