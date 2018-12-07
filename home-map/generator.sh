#!/bin/bash

# your account file
ACCOUNT_FILE="/Users/jerry/Documents/Blog/account"

USERNAME=`sed -n 1p $ACCOUNT_FILE`
PASSWORD=`sed -n 2p $ACCOUNT_FILE`
TOKEN=`sed -n 3p $ACCOUNT_FILE`

echo "Fetching visit data from Baidu Tongji"
python baidu_tongji.py $USERNAME $PASSWORD $TOKEN

echo "Generate visit map"
phantomjs capture.js

echo "Replace home-bg.png"
mv home-bg.png ../img/