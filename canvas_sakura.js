"use strict";

(function( $ ){
  $.fn.canvasSakura = function(opts) {
    var elm = this;
    var smart = window.innerWidth < 738;
    var canvas,
        XspeedMax = 2, // 横方向最大スピード
        XspeedMin = 1, // 横方向最小スピード
        YspeedMax = 3, // 縦方向最大スピード
        YspeedMin = 1, // 縦方向最小スピード
        rotate = true, // 回転を有効化するか否か
        maxRotateSpeed = 10, // 回転速度の最大値
        minRotateSpeed = -10, // 回転速度の最小値
        maxWidth = 50, // 桜の横幅最大値
        minWidth = 20, // 桜の横幅最小値
        vol = 30; // 桜の量
    var loadedImages = [],
        imagesPath = ['img/sakura_1.png', 'img/sakura_2.png'], // 使用する桜の画像
        objArr = [];

    function randomGen(min, max) {
      return Math.random() * (max - min) + min;
    }

    function loadImages(imagesSrc) {
      var promise = [];

      var _loop = function _loop(i, len) {
        var image = new Image();
        promise[i] = new Promise(function (resolve, reject) {
          image.onload = function () {
            loadedImages.push(image);
            resolve();
          };
        });
        image.src = imagesSrc[i];
      };

      for (var i = 0, len = imagesSrc.length; i < len; i++) {
        _loop(i, len);
      }

      Promise.all(promise).then(function () {
        init(canvas);
      });
    };

    function init(target, direction) {
      var canvas = target,
          ctx = canvas.getContext('2d'),
          cw = canvas.width,
          ch = canvas.height,
          _direction = direction;
      ctx.clearRect(0, 0, cw, ch);

      for (var i = 0; i < vol; i++) {
        var index = randomGen(0, loadedImages.length),
            x = randomGen(0, cw),
            width = randomGen(minWidth, maxWidth),
            aspect = loadedImages[index].height / loadedImages[index].width;

        if (smart) {
          width /= 2;
        }

        objArr.push({
          image: loadedImages[index],
          x: x,
          y: 0,
          aspect: aspect,
          w: width,
          h: width * aspect,
          angle: Math.random() * 360,
          step: 0,
          stepSize: randomGen(1, 5) / 100,
          rotate: randomGen(minRotateSpeed, maxRotateSpeed),
          speedx: randomGen(XspeedMin, XspeedMax),
          speedy: randomGen(YspeedMin, YspeedMax),
          flag: false
        });
      }

      startTiming();
      render(ctx, _direction); //  ctx.restore();
    }

    var rad = Math.PI / 180;

    function startTiming() {
      var i = 0;
      var interval = window.setInterval(function () {
        objArr[i].flag = true;
        i++;

        if (i >= vol) {
          clearInterval(interval);
        }
      }, 300);
    }

    function render(ctx, direction) {
      var cw = canvas.width,
          ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      ctx.save();

      for (var i = 0; i < vol; i++) {
        if (objArr[i].flag == true) {
          objArr[i].step += objArr[i].stepSize;
          objArr[i].x += objArr[i].speedx * Math.cos(objArr[i].step);
          objArr[i].y += objArr[i].speedy;
          objArr[i].angle += Math.random() * objArr[i].rotate;
          var cos = Math.cos(objArr[i].angle * rad);
          var sin = Math.sin(objArr[i].angle * rad);

          ctx.setTransform(1, 0, 0, 1, objArr[i].x, objArr[i].y);
          if(rotate === true){
          ctx.rotate(objArr[i].angle * rad);
          }
          ctx.drawImage(objArr[i].image, -objArr[i].w / 2, -objArr[i].h / 2, objArr[i].w, objArr[i].h);
          ctx.translate(-cw / 2, -ch / 2);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.rotate(0);

          if (objArr[i].y >= ch) {
            objArr[i].x = randomGen(0, cw);
            objArr[i].y = randomGen(-objArr[i].h, -objArr[i].h - 10);
          }
        }
      }

      window.requestAnimationFrame(function () {
        render(ctx, cw, ch, direction);
      });
    }

    function adjustCanvas() {
      canvas.setAttribute('width', canvas.dataset.originalWidth);
      canvas.setAttribute('height', canvas.dataset.originalHeight);
      var w = elm.width(),
          h = elm.height();
      canvas.setAttribute('width', w);
      canvas.setAttribute('height', h);
    }

    window.addEventListener('load', function () {
      var w = elm.width();
      var h = elm.height();

      canvas = document.createElement('canvas');
      $(canvas).attr('width', w);
      $(canvas).attr('height', h);
      
      canvas.dataset.originalWidth = canvas.width;
      canvas.dataset.originalHeight = canvas.height;
      console.log(elm)
      $(elm).append(canvas);
      adjustCanvas();
      loadImages(imagesPath);
    });
    var resizeTimer = false;
    window.addEventListener('resize', function () {
      smart = window.innerWidth < 738;

      if (resizeTimer !== false) {
        clearTimeout(resizeTimer);
      }

      resizeTimer = setTimeout(function () {
        adjustCanvas();
      }, 200);
    });
  };
})( jQuery );