
console.log('JAVASCRIPT STARTED');
function close_download_tag() {
    let download_href = document.getElementById('download_tag');
    download_href.innerText = ''
    //download_href.href = ''

}

function collect_aug_data() {
    aug_list = [];
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
        if (vertically_flipped) {
            probability = document.getElementById('')
            aug_list[-1].push(probability)//push probability if advanced
        }
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
    return aug_list;
}
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
            pop_up.style.display='none';
            console.log('unchecked checkbox')
        }
    }


}
class range_input_scripts {

    update_probabilities() {
        let sliders = ['rotate_90_probability', 'crop_probability', 'horizontal_flip_probability', 'vertical_flip_probability', 'Rotate_probability', 'Rotate_limit'];
        let i = 0
        while (i < sliders.length) {
            console.log(sliders[i]);
            let slider = document.getElementById(sliders[i]);
            let show_slider = document.getElementById(`show_${sliders[i]}`)
            show_slider.innerText = slider.value
            i++
        }
    }
    update_crop_percent_of_image_cropped() {
        let min_range_id = 'min_cropped'
        let max_range_id = 'max_cropped'
        let min_text_id = 'crop_min_percent'
        let max_text_id = 'crop_max_percent'

        let max_range_element = document.getElementById(max_range_id)
        let min_range_element = document.getElementById(min_range_id)
        let min_text_element = document.getElementById(min_text_id)
        let max_text_element = document.getElementById(max_text_id)
        min_text_element.innerText = min_range_element.value
        max_text_element.innerText = max_range_element.value

    }
}
let file_id;
class copy_paste_code_scripts {
    copy_and_paste() {
        let copy_text = document.getElementById('code_block'); // id of the textbox
        copy_text.select();
        navigator.clipboard.writeText(copy_text.value);
        //document.execCommand("copy");
        alert('copy and pasted augmentation code');
    }

    show_copy_and_paste_checkbox() {
        /*let aug_string = "import albumentations as A\n" + "import cv2\n" +
             "transform = A.Compose([\n" + "A.RandomCrop(width=256, height=256),\n" +
             "A.HorizontalFlip(p=0.5),\n" +
             "A.RandomBrightnessContrast(p=0.2)])\n";*/
        let check_box_element = document.getElementById('copy_paste_div');
        check_box_element.style.display = 'block';
        let text_box = document.getElementById('code_block');
        text_box.value = 'test';
        file_id = "id" + Math.random().toString(16).slice(2);
        // Access Dropzone instance
        close_download_tag();
        var dropzone = Dropzone.forElement('#dropper');
        // Process the queue
        dropzone.processQueue();
        //dropzone.removeAllFiles(true);
        // sending over
    }
}
let display_popups_methods = new display_popups();
let copy_paste_code_methods = new copy_paste_code_scripts();
let range_input_methods = new range_input_scripts();

Dropzone.options.dropper = {
    paramName: 'file',
    autoProcessQueue: false,
    chunking: true,
    forceChunking: true,
    url: '/upload',

    init: function () {
        this.on("queuecomplete", async function () {

            alert("All files have uploaded. Augmenting now...");
            await this.removeAllFiles(true);
            console.log('file id:', file_id);
            let data1 = 'false';
            //while (data1 != 'true') {
            //sleep(5);
            //this.removeAllFiles(true);
            await fetch('/check_finished/' + file_id).then(response => {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json().then(data => {
                        data1 = JSON.stringify(data);
                        console.log('DATA:', data)
                    });
                } else {
                    return response.text().then(text => {
                        console.log('text:', text)
                        data1 = text;
                        console.log('data1:', data1)
                        // The response wasn't a JSON object
                        // Process your text as a String
                    });
                }
            });
            //}
            document.getElementById('download_tag').innerText = 'click here to download augmented dataset';
            document.getElementById('download_tag').href = '/download/' + file_id;
        });

        let aug_form_data = collect_aug_data();
        this.on("sending", function (file, xhr, formData) {
            // Add parameters to be sent with every chunk request
            formData.append('id', file_id);
            formData.append('aug data', aug_form_data)
        });
    },

    maxFilesize: 100 * 1e+3, // MB 
    chunkSize: (1e+9), // bytes
    acceptedFiles: ".zip",
    maxFiles: 1,
    maxfilesexceeded: function (file) {
        this.removeAllFiles();
        this.addFile(file);
    }
}
// document.getElementById('dropzone_submit').addEventListener('click', function () {
//     // Access Dropzone instance
//     close_download_tag();
//     var dropzone = Dropzone.forElement('#dropper');
//     // Process the queue
//     dropzone.processQueue();
//     //dropzone.removeAllFiles(true);
// });
