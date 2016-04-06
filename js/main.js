var isRepeater = jQuery.cookie('repeater');
jQuery.cookie('repeater', true, {expire: 7})
var BGM_player, opening_player, ending_player, volume = 0.5, music_disable = ($.cookie('music_disable')?$.cookie('music_disable'):false), $audio_control;

/**
 *  ブラウザ名を取得
 *
 *  @return     ブラウザ名(ie6、ie7、ie8、ie9、ie10、ie11、chrome、safari、opera、firefox、unknown)
 *
 */
var getBrowser = function(){
    var ua = window.navigator.userAgent.toLowerCase();
    var ver = window.navigator.appVersion.toLowerCase();
    var name = 'unknown';

    if (ua.indexOf("msie") !== -1){
        if (ver.indexOf("msie 6.") !== -1){
            name = 'ie6';
        }else if (ver.indexOf("msie 7.") !== -1){
            name = 'ie7';
        }else if (ver.indexOf("msie 8.") !== -1){
            name = 'ie8';
        }else if (ver.indexOf("msie 9.") !== -1){
            name = 'ie9';
        }else if (ver.indexOf("msie 10.") !== -1){
            name = 'ie10';
        }else{
            name = 'ie';
        }
    }else if(ua.indexOf('trident/7') !== -1){
        name = 'ie11';
    }else if (ua.indexOf('chrome') !== -1){
        name = 'chrome';
    }else if (ua.indexOf('safari') !== -1){
        name = 'safari';
    }else if (ua.indexOf('opera') !== -1){
        name = 'opera';
    }else if (ua.indexOf('firefox') !== -1){
        name = 'firefox';
    }
    return name;
};

/**
 *  対応ブラウザかどうか判定
 *
 *  @param  browsers    対応ブラウザ名を配列で渡す(ie6、ie7、ie8、ie9、ie10、ie11、chrome、safari、opera、firefox)
 *  @return             サポートしてるかどうかをtrue/falseで返す
 *
 */
var isSupported = function(browsers){
    var thusBrowser = getBrowser();
    for(var i=0; i<browsers.length; i++){
        if(browsers[i] === thusBrowser){
            return true;
        }
    }
    return false;
};

function onYouTubePlayerReady(playerid){
  var player = document.getElementById(playerid);
  if(playerid === "openingPlayer"){
    opening_player = player;
    player.setVolume(volume * 100 * 2);
    if(isRepeater){
      player.pauseVideo();
    } else {
      player.addEventListener("onStateChange", "onOpeningPlayerStateChange");
    }
  } else if (playerid === "endingPlayer") {
    ending_player = player;
    player.setVolume(volume * 100 * 1.5);
    player.cueVideoById("S4DcfqxCTsA");
    player.addEventListener("onStateChange", "onEndingPlayerStateChange");
  }
}

function onOpeningPlayerStateChange(newState) {
  if (newState === 0 ){
    $(".opening_movie").fadeOut(function(){
      closeOpening();
    });
  }
}

function onEndingPlayerStateChange(newState) {
  if (newState === 1 ){
    BGM_player.pause();
  } else if (newState === 0) {
    if ( !music_disable ) {
      BGM_player.play();
    }
    $(".ending").off('mousewheel').off('scroll').fadeOut(function() {
        var $text = $('.ending_wrapper .text');
        $text.data('offset_top', $text.offset().top);
        var $scene = $('.ending_wrapper .scene');
        $scene.data('offset_top', $scene.offset().top);
        $(document).trigger('scrolled');
    });
    ending_player = false;
  }
}

function closeOpening () {
  $('.audio_wrapper').fadeIn();
  if ( BGM_player ) {
    var intervalID;
    var cnt = 0;
    BGM_player.setVolume(0);
    BGM_player.play();
    intervalID = setInterval(function(){
      cnt++;
      if(cnt === 10) {
        clearInterval(intervalID);
      } else {
        BGM_player.setVolume( volume * cnt / 10 );
      }
    }, 200);
  }
}

// jQuery.noConflicts();
(function($){
  $(function(){
    var $window_height = $(window).height();
    var $scroll_top = $(document).scrollTop();
    var scene_num = 0;

    if(isRepeater){
      $(".opening_movie").hide();
    }

    /**
     * ========================================
     *  audio
     * ========================================
     */
    audiojs.events.ready(function() {
      var as = audiojs.createAll();
      BGM_player = as[0];
      $audio_control = $(".audiojs");
      if( isRepeater ) {
        $('.audio_wrapper').fadeIn();
        if ( !music_disable ) {
          BGM_player.play();
        }
      }

      $('.play-pause .pause').click(function(){
        volume = 0;
        music_disable = true;
        $.cookie('music_disable', true, {expire: 7});
        ending_player.setVolume(0);
        // opening_player.setVolume(0);
      });
      $('.play-pause .play').click(function(e){
        volume = 0.5;
        music_disable = false;
        $.cookie('music_disable', false, {expire: 7});
        ending_player.setVolume(volume * 100 * 1.5);
        if(ending_player.getPlayerState() === 1){
          e.stopPropagation();
          e.preventDefault();
          return false;
        }
        // opening_player.setVolume(volume * 100 * 2);
      });

    });


    /**
     * =======================================================
     * init_social_btn
     * =======================================================
     */
    var init_social_btn = function(){
      var $social = $(".social");
      var $social_buttons = $social.find("> div:not('.individual')");
      var $social_buttons_balloons = $social_buttons.find('.balloon');
      var timeoutID;
      $social_buttons
        .click(function(){
          return false;
        })
        .hover(
          function(){
            clearTimeout(timeoutID);
            $social_buttons_balloons.hide();
            $(this).find('.balloon').show();
          },
          function(){
            var $this = $(this);
            clearTimeout(timeoutID);
            timeoutID = setTimeout(function(){
              $this.find('.balloon').hide();
            }, 100);
          }
        )
      ;
    };
    init_social_btn();

    /**
     * =======================================================
     * init_players
     * =======================================================
     */
    var init_players = function(){
      var _window_width = $(window).width();
      var _window_height = $(window).height();
      var aspect = 16/9;
      var width, height;
      if( _window_height * aspect > _window_width ) {
        height = _window_height;
        width = height * aspect;
      } else {
        width = _window_width;
        height = width / aspect;
      }
      $("#openingPlayer, #endingPlayer")
        .attr({
          "width":  width,
          "height": height
        })
        .css({
          "margin-top": -(height - $window_height) /2 + 'px',
          "margin-left": -(width - $(window).width()) /2 + 'px'
        })
      ;
    }
    init_players();

    /**
     * =======================================================
     * fix_size
     * =======================================================
     */
    var fix_size = function(){
      var height = $(window).height() * 1.31;
      $window_height = $(window).height();
      var width = height * 16/9;
      $(".scene, .scene > .inner_bg").css("background-size", width + "px " + height + "px");
      $("#openingPlayer, #endingPlayer")
        .attr({
          "width":  width,
          "height": height
        })
        .css({
          "margin-top": -(height - $window_height) /2 + 'px',
          "margin-left": -(width - $(window).width()) /2 + 'px'
        })
      ;
      $(".scene").each(function(){
        var $scene = $(this);
        $scene.data('offset_top', $scene.offset().top);
        $scene.data('height', $scene.height());
      });

      var $ending_wrapper = $(".ending_wrapper");
      $ending_wrapper.data('offset_top', $ending_wrapper.offset().top);
    };
    fix_size();
    $(window).resize(fix_size);

    /**
     * =======================================================
     * mousewheel
     * =======================================================
     */
    var init_mousewheel = function(){
      var $wrapper = $(".wrapper");
      var $document = $(document);
      var $scenes = $('.scene');
      $(document).on('scrolled', function(){
        $scenes.filter(function(i, scene) {
          var $scene = $(scene);
          var data = $scene.data();
          return $scroll_top + $window_height > data.offset_top &&
                 $scroll_top < data.offset_top + data.height;
        }).each(function(i, scene) {
          var $scene = $(scene);
          $inner_bg = $scene.find(".inner_bg")
          var clamped_pos = Math.min($scroll_top - $scene.data('offset_top'), $window_height * 4);
          var background_position_top = $window_height * 0.088 * clamped_pos / $window_height;
          background_position_top = Math.max(background_position_top,0);
          $scene.css({"background-position": "center -" + background_position_top + "px"});
          $inner_bg.css({"background-position": "center -" + background_position_top + "px"});

          var percent = ($scroll_top - ($scene.data('offset_top')+$window_height)) / $window_height;
          percent = Math.max(percent,0);
          $inner_bg.css("opacity", Math.min(percent, 1));

          var _num = parseInt($scene.attr('id').replace(/^[^\d]*(\d+)[^\d]*$/, "$1"), 10);
          if(
            $scroll_top > $scene.data('offset_top') &&
            $scene.data('offset_top') + $scene.data('height') > $scroll_top &&
            scene_num !== _num
          ) {
            $(document).trigger('change_nav', _num);
          }
        });
      });
    };
    init_mousewheel();

    /**
     * =======================================================
     * init_scroll
     * =======================================================
     */
    var init_scroll = function(){
      $(document).scroll(function(){
        $window_height = $(window).height();
        $scroll_top = $(document).scrollTop();
        $(document).trigger('scrolled');
      });
    }
    init_scroll();

    /**
     * =======================================================
     * navi smoothScroll
     * =======================================================
     */
    $(".scroll_nav li a, .opening .scroll a").smoothScroll({
      speed: 3000,
      afterScroll: function() {
        var _num = parseInt($(this).attr('href').replace(/^[^\d]*(\d+)[^\d]*$/, "$1"), 10);
        $(document).trigger('change_nav', _num);
      }
    });
    /**
     * change_nav
     */
    $(document).on('change_nav', function(){
      scene_num = arguments[1];
      switch(scene_num){
        case  1:
        case  5:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_1").addClass('active'); break;
        case  6:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_2").addClass('active'); break;
        case  7:
        case  9:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_3").addClass('active'); break;
        case 10:
        case 13:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_4").addClass('active'); break;
        case 14:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_5").addClass('active'); break;
        case 15:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_6").addClass('active'); break;
        case 16:
        case 17:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_7").addClass('active'); break;
        case 18:
        case 19:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_8").addClass('active'); break;
        case 20:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_9").addClass('active'); break;
        case 21:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_10").addClass('active'); break;
        case 22:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_11").addClass('active'); break;
        case 23:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_12").addClass('active'); break;
        case 24:
          $(".scroll_nav li").removeClass('active'); $(".scroll_nav li#series_13").addClass('active'); break;
      }
    });

    /**
     * =======================================================
     * open overlay
     * =======================================================
     */
    $(".text").not('.page')
    .on('click', function(){
      var $overlay = $(".overlay");
      var num = $(this).data("itemid");
      var sharetext = $(this).data("sharetext") + " | 『続・終物語』刊行記念 メモリアルサイト | MONOGATARI DROPS http://kodansha-box.jp/topics/nishio/drops/";
      $("#overlay_image_1, #overlay_image_2").show();
      $overlay.show();

      $("#share_individual").attr("href", "https://twitter.com/intent/tweet?text="+encodeURIComponent(sharetext));

      // $('.social').fadeOut();
      $('.social .facebook, .social .twitter.global').hide();
      $('.social .twitter.individual, .social .share_info').show();

      var cnt = 0;
      var intervalID = setInterval(function(){
        cnt++;
        $("#overlay_image_"+cnt).fadeOut(100);
        if ( cnt === 2 ) {
          clearInterval(intervalID);
        }
      }, 500);
    })
    .on('mouseover', function(){
      var $overlay = $(".overlay");
      var num = $(this).data("itemid");
      var $closeBtn = $overlay.find(".close");
      if ( $(this).data("font-color") === 'black' ) {
        $closeBtn.removeClass("white").addClass("black");
      } else {
        $closeBtn.removeClass("black").addClass("white");
      }
      $("#overlay_image_1").css("background-image", "url(imgs/scene/low/"+num+"_1.jpg)");
      $("#overlay_image_2").css("background-image", "url(imgs/scene/low/"+num+"_2.jpg)");
      $("#overlay_image_3").css("background-image", "url(imgs/scene/kime/"+num+".jpg)");
      $("#overlay_image_1, #overlay_image_2").show();
    });

    /**
     * opening
     */
    $(".opening_movie")
      .mousewheel(function(e){
        e.preventDefault();
        e.stopPropagation();
        return false;
      })
      .scroll(function(e){
        e.preventDefault();
        e.stopPropagation();
        return false;
      })
    ;

    /**
     * close button
     */
    $('.close').click(function(){
      var target_elem = $($(this).attr("data-close-target"));
      target_elem.fadeOut();
      return false;
    });
    $('.overlay').click(function(){
      $(this).find(".close").click();
    });
    /**
     * close opening with button
     */
    $('.opening_movie .close').click(function(){
      closeOpening();
    });

    /**
     * hide social button
     */
    $(".overlay .close").click(function(){
      $(".overlay").hide();
      $("#present").hide();
      // $('.social').fadeIn();
      $('.social .facebook, .social .twitter.global').show();
      $('.social .twitter.individual, .social .share_info').hide();

    });
    /**
     * hide overlay & reactive socialButton
     */
    $(".overlay").mousewheel(function(e){
      e.stopPropagation();
      e.preventDefault();
      $(this).fadeOut();
      // $('.social').fadeIn();
      $('.social .facebook, .social .twitter.global').show();
      $('.social .twitter.individual, .social .share_info').hide();
      $("#present").fadeOut();
      return false;
    });

    /**
     * =======================================================
     * hitagi_animation
     * =======================================================
     */
    var hitagi_animation = function() {
      var intervalID;
      var $hitagi_img = $("#hitagi img");
      var images = [ "imgs/animation/1.png",
      "imgs/animation/2.png",
      "imgs/animation/3.png",
      "imgs/animation/4.png",
      "imgs/animation/5.png",
      "imgs/animation/6.png" ];
      var $images = [];
      var cnt = 0;

      $.each(images, function(i){
        var $img = new Image();
        $img.src = images[i];
        $images.push($img);
      });

      var imgLoad = imagesLoaded( $images );

      var lastChange = 0;
      imgLoad.on('done', function(){
        var flag = true;
        $(document).on('scrolled', function(){
          var now = Date.now();
          if (now - lastChange > 1000 / 12) {
            cnt++;
            lastChange = now;
            $hitagi_img.attr("src", images[cnt % images.length]);
          }
        });
      });

      var $hitagi = $("#hitagi");
      var threshold_sz = ($(".scene").size() * 4.5 + $(".has_2").size() * 1.5 + $(".has_3").size() * 3 + $(".has_5").size() * 6 - 8);
      $(document).on('scrolled', function(){
        var threshold = $window_height * threshold_sz;
        if( $scroll_top > threshold ) {
          $hitagi.css('transform', 'translateY(-'+($scroll_top - threshold) / 2 + 'px)');
          $(document).trigger('ending_movie_start');
        } else {
          $hitagi.css('transform', 'none');
        }
      });
      $(document).one("ending_movie_start", function(){
        if(music_disable){
          ending_player.setVolume(0);
        } else {
          ending_player.setVolume(volume * 100 * 1.5);
        }
        ending_player.playVideo();
      });
    };
    hitagi_animation();

    /**
     * =======================================================
     *  scene scroll animation
     * =======================================================
     */
    var ending = function(){
      var $ending_wrapper = $(".ending_wrapper");
      var $ending = $(".ending");
      var stopevent = function(e){
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      $(document).on('scrolled', function(){
        if( $scroll_top > $ending_wrapper.data('offset_top') ) {
          $ending.css({ 'position': 'fixed' });
          // console.log(ending_player.getPlayerState());
          if( ending_player ) {
            if (ending_player.getPlayerState() === 1 || ending_player.getPlayerState() === -1) {
              window.scrollTo(0, $ending_wrapper.data('offset_top'));
              $ending
                .on('mousewheel', stopevent)
                .on('scroll', stopevent)
              ;
            }
          } else {
            $(".ending")
              .off('mousewheel', stopevent)
              .off('scroll', stopevent)
            ;
          }
        } else {
          $ending
            .css({ 'position': 'relative' })
            .off('mousewheel', stopevent)
            .off('scroll', stopevent)
          ;
        }
      });
    }
    ending();

    /**
     * =======================================================
     *  scene scroll animation
     * =======================================================
     */
    $(".scene").each(function(){
      var $scene = $(this),
          $objects_prototype = $('.main > .objects'),
          $objects_wrapper = $objects_prototype.clone().appendTo($scene)
      ;

      $scene.data("objects", $objects_wrapper.find("img"));
      $scene.data("contents", $scene.find(".content"));


      var objectsVisible = null;
      $(document).on('scrolled', function(){
        var newVisible = $scroll_top + $window_height > $scene.data('offset_top') &&
                   $scroll_top < $scene.data('offset_top') + $scene.data('height');
        if (objectsVisible !== newVisible) {
          if(newVisible) {
            $scene.data("objects").show();
          } else {
            $scene.data("objects").hide();
          }
          objectsVisible = newVisible;
        }
      });

      $scene.data("contents")
      .each(function(){
        var $content = $(this);
        var $texts = $content.find(".text");
        $texts.each(function(){
          // var size = - Math.random() * ($window_height * 2 - $window_height * 3/4) + $window_height * 3/4;
          // if(isSupported(['safari'])){
          //   size = - Math.random() * ($window_height * 2 - $window_height * 1) + $window_height * 1;
          // }
          // var content_num = ( $scene.hasClass("content_2nd") ? 4.5 :
          //                     $scene.hasClass("content_3rd") ? 6 :
          //                     $scene.hasClass("content_4th") ? 7.5 :
          //                     $scene.hasClass("content_5th") ? 9 :
          //                     3 );
          // var page = (function(){
          //   if ( $content.hasClass('content_2nd') ) {
          //     return 4.5;
          //   } else if ( $content.hasClass('content_3rd') ) {
          //     return 6;
          //   } else {
          //     return 3;
          //   }
          // })();
          var $object = $(this);
          // preload
          $object.one('show', function(){
            var num = $(this).data("itemid");
            var kime = new Image();
            var img1 = new Image();
            var img2 = new Image();
            kime.src = "imgs/scene/kime/"+num+".jpg";
            img1.src = "imgs/scene/low/"+num+"_1.jpg";
            img2.src = "imgs/scene/low/"+num+"_2.jpg";
          });
          $object.data('height', $object.height());
          $object.data('offset_top', $object.offset().top);
          $(document).on('scrolled', function(){
            var wants = Math.min(($scroll_top + $window_height - 70) - $object.data('offset_top'),
                                 ($object.data('offset_top') + $object.data('height')) - ($scroll_top + 300));
            wants = Math.max(0, Math.min(1, 0.5 + (wants / 200)));
            wants = -0.5 * (Math.cos(Math.PI*wants) - 1)
            //wants = 1 / (1 + Math.exp((wants * 0.08) - 4));
            var state = $object.data('opacity');
            if (state !== wants) {
                $object.data('opacity', wants);
                $object[0].style.opacity = wants;
                if (+state === 0) {
                  $object.trigger('show');
                }
            }
            // if(
            //   $scroll_top + $window_height < $scene.data('offset_top') + $scene.height() &&
            //   $scroll_top > $scene.data('offset_top')
            // ) {
            //   var translateY = size * (content_num - (($scroll_top - $scene.data('offset_top')) / $window_height));
            //   $object.css({'transform': 'translateY(' + translateY + 'px)'});
            // }
          });
        });
      });

      $scene.data("objects")
      .show()
      .each(function(){
        var top = Math.random() * $scene.height();
        var left = Math.random() * $scene.width();
        var rotate = Math.random() * 360;
        var size = - Math.random() * ($window_height * 2 - $window_height * 3/4) + $window_height * 3/4;
        if(isSupported(['safari'])){
          size = - Math.random() * ($window_height * 2 - $window_height * 1) + $window_height * 1;
        }
        var $object = $(this);
        $object.css({
          'position': 'absolute',
          'top': top + "px",
          'left': left + "px",
          'transform': 'rotateZ(' + rotate + 'deg)'
        });
        $object.data('offset_top', top);

        $(document).on('scrolled', function(){
          if(
            $scroll_top + $window_height > $scene.data('offset_top') &&
            $scroll_top < $scene.data('offset_top') + $scene.data('height')
          ) {
            var translateY = size * (3 - (($scroll_top - $scene.data('offset_top')) / $window_height));
            $object.css({'transform': 'translateY(' + translateY + 'px) rotateZ(' + rotate + 'deg)'});
          }
        });
      });
    });

    $("#close_btn").click(function(){
      $("#present").fadeOut();
      return false;
    });
    $("#badge_btn").click(function(){
      var $overlay = $("#present");
      $overlay.fadeIn();
      return false;
    });
    $("#share_info").click(function(){
      var $overlay = $("#present");

      if($overlay.css('display') === "block") {
        $overlay.fadeOut();
      } else {
        $overlay.fadeIn();
      }
      return false;
    });


  });
})(jQuery);
