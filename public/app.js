"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const dropZone = document.getElementById('drop_zone');
function registerFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('/register_folder', { method: 'POST' });
        const data = yield response.json();
        return data.folder_id;
    });
}
function uploadFile(file, folderId, path) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch('/upload', {
            method: 'PUT',
            headers: {
                'folder-id': folderId,
                'file-path': path
            }, // thereeeee we go. Let me look around a bit 
            body: file
        });
    });
}
function finishUpload(folderId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch('/finish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder_id: folderId })
        });
    });
}
dropZone === null || dropZone === void 0 ? void 0 : dropZone.addEventListener('drop', (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    event.preventDefault();
    // Register the new folder on the server
    const folderId = yield registerFolder();
    // This example assumes you're dropping a single directory
    const items = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.items;
    if (!items)
        return;
    for (const item of items) {
        // If the item is a file, upload it
        if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
                yield uploadFile(file, folderId, file.name);
                // if file.name contains the path, then none of the entry/directory reader
                // stuff is necessary
            }
        }
        // const entry = item.webkitGetAsEntry();
        // if (entry?.isDirectory) {
        //     const reader = entry.createReader(); 
        //     reader.readEntries(async (entries) => {
        //         for (const fileEntry of entries) {
        //             if (fileEntry.isFile) {
        //                 fileEntry.file(async (file) => {
        //                     await uploadFile(file, folderId, fileEntry.fullPath);
        //                 });
        //             }
        //         }
        //     });
        // }
    }
    // Once all files are uploaded, notify the server
    yield finishUpload(folderId);
}));
dropZone === null || dropZone === void 0 ? void 0 : dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
});
