var page = require('webpage').create();
var fs = require('fs');
//要打印的url地址
var address = 'http://127.0.0.1:8887/index.html';
//存储文件路径和名称
var outputPng = './home-bg.png';
//设置长宽
// page.viewportSize = { width: 3000, height: 1000 };
 
page.open(address, function(status) {
		var bb = page.evaluate(function() {
            return document.getElementById('world-map').getBoundingClientRect();
        });
        page.clipRect = {
            top : bb.top,
            left : bb.left,
            width : bb.width,
            height : bb.height
        };
        window.setTimeout(function() {
            page.render(outputPng);
            page.close();
            console.log('渲染成功...');
            phantom.exit();
        }, 1000);
});