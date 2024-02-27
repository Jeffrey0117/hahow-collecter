# hahow-collecter
## 檔案說明：
![](https://i.imgur.com/jVoal89.png)

## 需要先設定登入資料
![](https://i.imgur.com/AlYihyn.png)
.env是變數檔案，設定登入憑證用的。

## 執行檔有兩個：

### 「HahowDownloader」
這是直接下載的exe，執行後會針對設定好的課程直接全下載。

### 「downloadbySelect」
這個執行後，會先顯示帳號內所有課程，並且可以選擇下載章節。
推薦執行這個！
兩個選一個執行，功能差不多。

### 原始碼也是兩個：
dnew.js
index.js
這兩個東西基本上是一樣的內容，dnew是我的原始碼，而index.js是它的分身，是藉由ncc套件打包過後的檔案。
前者需要安裝該裝的套件才可以用，後者可以不依賴安裝套件即可執行。
而兩者都需要nodeJS的環境。

不懂的人可以忽略掉這個原始碼的檔案，刪掉也OK，留下exe就好了。

## 使用方法：

整包下載回來解壓縮，裡面長這樣：
![](https://i.imgur.com/KemURhl.png)

需要的檔案只有.env以及exe這兩個，先編輯.env把登入憑證設定好，
如果是執行「downloadbyID」的話需要把classID也填好，總共寫好三個變數
如果是執行「downloadbySelect」的話則不用，只要兩個變數填好即可執行。
![](https://i.imgur.com/FeJnYry.png)
下載後把.env以及exe放在要下載的地方，推薦D:/裡面，
然後打開cmd，切換路徑到該路徑底下，再輸入downloadbySelect.exe或HahowDownloader.exe執行即可。
