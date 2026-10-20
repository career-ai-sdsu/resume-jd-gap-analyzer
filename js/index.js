const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const fileInfo = document.getElementById("file-info");
const fileName = document.getElementById("file-name");
const fileSize = document.getElementById("file-size");
const removeButton = document.getElementById("remove-button");
const submitButton = document.getElementById("submit-button");
const statusMessage = document.getElementById("status-message");

// Set this to the server endpoint when a backend upload route is available.
const uploadEndpoint = null;

let selectedFile = null;

dropZone.addEventListener("click", () => {
    fileInput.click();
});

dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInput.click();
    }
});

fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        selectFile(fileInput.files[0]);
    }
});

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", (event) => {
    if (!dropZone.contains(event.relatedTarget)) {
        dropZone.classList.remove("drag-over");
    }
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    if (event.dataTransfer.files.length > 0) {
        selectFile(event.dataTransfer.files[0]);
    }
});

function selectFile(file) {
    if (!(file instanceof File)) {
        showStatus("The selected item is not a valid file.", "error");
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = "flex";
    submitButton.disabled = false;
    showStatus("");
}

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} bytes`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function clearSelectedFile() {
    selectedFile = null;
    fileInput.value = "";
    fileInfo.style.display = "none";
    submitButton.disabled = true;
}

removeButton.addEventListener("click", clearSelectedFile);

function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.dataset.type = type;
}

async function submitFile() {
    if (!selectedFile) {
        showStatus("Please select a file before submitting.", "error");
        return;
    }

    // FormData keeps the original file metadata and is ready for a multipart request.
    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);

    if (!uploadEndpoint) {
        // No backend exists yet. Make the prepared data available to future processing.
        window.dispatchEvent(new CustomEvent("file:ready", {
            detail: { file: selectedFile, formData }
        }));
        showStatus(`${selectedFile.name} is ready for processing.`, "success");
        return;
    }

    submitButton.disabled = true;
    showStatus("Uploading file…");

    try {
        const response = await fetch(uploadEndpoint, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}.`);
        }

        showStatus("File uploaded successfully.", "success");
    } catch (error) {
        console.error("File upload error:", error);
        showStatus("The file could not be uploaded. Please try again.", "error");
    } finally {
        submitButton.disabled = false;
    }
}

submitButton.addEventListener("click", submitFile);
