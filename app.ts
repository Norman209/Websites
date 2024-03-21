const dropZone = document.getElementById('drop_zone');

async function registerFolder(): Promise<string> {
    const response = await fetch('/register_folder', { method: 'POST' });
    const data = await response.json();
    return data.folder_id;
}

async function uploadFile(file: File, folderId: string, path: string) {
    await fetch('/upload', {
        method: 'PUT',
        headers: {
            'folder-id': folderId,
            'file-path': path
        }, // thereeeee we go. Let me look around a bit 
        body: file
    });
}

async function finishUpload(folderId: string) {
    await fetch('/finish', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder_id: folderId })
    });
}

dropZone?.addEventListener('drop', async (event) => {
    event.preventDefault();

    // Register the new folder on the server
    const folderId = await registerFolder();

    // This example assumes you're dropping a single directory
    const items = event.dataTransfer?.items;
    if (!items) return;

    for (const item of items) {
        // If the item is a file, upload it
        if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
                await uploadFile(file, folderId, file.name); 
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
    await finishUpload(folderId);
});

dropZone?.addEventListener('dragover', (event) => {
    event.preventDefault();
});
