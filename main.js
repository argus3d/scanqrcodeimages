const { app, BrowserWindow, ipcMain, dialog } = require('electron');  // Ensure ipcMain is imported
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const jsQR = require('jsqr');

// Directory to scan
var directoryPath = '/Users/argus/Library/CloudStorage/OneDrive-Pessoal/Sae/LD/2024_L4/L4/EM/POR';




function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Ensure context isolation is enabled
            enableRemoteModule: false,
        },
    });

    mainWindow.loadFile('index.html');

    // Open DevTools (optional)
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('select-folder', async (event) => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });

        if (result.canceled) return null;

        const folderPath = result.filePaths[0];
        const files = getFilesRecursively(folderPath);

        return files;
    });
    ipcMain.handle('verify-qrcode', async (event, filePath) => {
        //console.log(await decodeQR(filePath));
        const result = await decodeQR(filePath);
        return result;
      });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function getFilesRecursively(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
  
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
  
      if (stat && stat.isDirectory()) {
        // Recursively search in subdirectories
        results = results.concat(getFilesRecursively(file));
      } else if (file.toLowerCase().includes('qr_')) {
        // Only include files with "qr_" in the name
        results.push({
          name: path.basename(file),
          path: file
        });
      }
    });
  
    return results;
  }
const getFilesInDirectory = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getFilesInDirectory(filePath, fileList);
        } else {
            if (file.toLowerCase().includes('qr_')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
};


const decodeQR = async (_file) => {
    try {
        // Load the image with Jimp
        const image = await Jimp.read(_file);

        // Get the image data
        const imageData = {
            data: new Uint8ClampedArray(image.bitmap.data),
            width: image.bitmap.width,
            height: image.bitmap.height,
        };

        // Use jsQR to decode the QR code
        const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

        if (!decodedQR) {
            throw new Error('QR code not found in the image.');
        }

        return decodedQR.data;
    } catch (error) {
        console.error('Error decoding QR code:', error);
    }
}


// Main function to search for files and scan for QR codes
const main = async () => {
    const files = getFilesInDirectory(directoryPath);
    for (const file of files) {

        console.log(await decodeQR(file));

    }
};
