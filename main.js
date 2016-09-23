const {app} = require('electron')

const {BrowserWindow} = require('electron')
// 保持一個對於 window 物件的全域的引用，不然，當 JavaScript 被GC，
// window 會被自動地關閉

const ipc		= require('electron').ipcMain
const dialog	= require('electron').dialog
const fs		= require('fs')
const shell		= require('electron').shell
var mainWindow = null;

// 當所有窗口被關閉了，退出。
app.on('window-all-closed', function() {
	// 在macOS 上，通常使用者在明確地按下 Cmd + Q 之前
	// 應用會保持活動狀態
	if (process.platform != 'darwin') {
		app.quit();
	}
});

// 當Electron 完成了初始化並且準備創建瀏覽器視窗的時候
// 這個方法就被調用
app.on('ready', function() {
	// 創建瀏覽器視窗
	mainWindow = new BrowserWindow({width: 800, height: 600});

	// 載入應用程式的 index.html
	mainWindow.loadURL(`file://${__dirname}/index.html`);

	// 打開開發者工具
	mainWindow.webContents.openDevTools();
	mainWindow.setMenu(null);
	// 當window 被關閉，這個事件會被觸發
	mainWindow.on('closed', function() {
		// 取消引用 window 物件，如果你的應用程式支援多視窗的話，
		// 通常會把多個 window 物件存放在一個數組裡面，
		// 但這次不是。
		mainWindow = null;
	});
});

ipc.on('save-dialog', function (event) {
	const options = {
		title: '另存新檔',
		defaultPath: 'Overtime.pdf',
		filters: [
			{ name: '可攜式文件格式(PDF)', extensions: ['pdf'] }
		]
	}
	dialog.showSaveDialog(options, function (filename) {
		event.sender.send('saved-file', filename)
	})
})

ipc.on('print-to-pdf', function (event, path) {
	const win = BrowserWindow.fromWebContents(event.sender)
	// Use default printing options
	win.webContents.printToPDF({}, function (error, data) {
		if (error) throw error
		fs.writeFile(path, data, function (error) {
			if (error) {
				throw error
			}
			shell.openExternal('file://' + path)
		})
	})
})
ipc.on('open-website', function (event) {
    shell.openExternal('https://shiaofang.blogspot.tw');
})