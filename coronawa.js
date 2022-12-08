var pname;
var gbl_data;
var gbl_path;
var p_data;
var keyword;
var pad;
var device;

$('#select').hide();
$("#move").hide();
alert("안녕하세요?\n부산지역주민들을 위해 코로나확진자 정보를 한눈에 확인 할 수 있도록 만들었습니다.\n정보 공개의 범위 변경으로 인해\n3월 20일까지의 내용만 들어가 있습니다.");

var arr = new Array();
var inf_arr = new Array();
var mar_arr = new Array();

var mapContainer2 = document.getElementById('map_'), // 지도를 표시할 div
  mapOption2 = {
    center: new daum.maps.LatLng(35.137922, 129.055628), // 지도의 중심좌표
    level: 9
    // 지도의 확대 레벨
  };

const map2 = new kakao.maps.Map(mapContainer2, mapOption2);
$('#map_').hide();

// document.getElementById("mask").onclick = function() {
//   $("#mask").hide();
//   $("#map").hide();
//   $('#map_').show();
//   $('#select').show();
//   $("#move").show();
//   alert("개발중입니다...");
// }
// document.getElementById("move").onclick = function() {
//   $("#move").hide();
//   $("#map_").hide();
//   $('#select').hide();
//   $('#map').show();
//   $("#mask").show();
// }

$.ajax({
  type: "POST",
  url: "check.php",
  async: false,
  dataType: "JSON",
  success: function(data) {
    gbl_data = data;
  },
  error: function(data) {
    alert("error");
  }
});

var mapContainer = document.getElementById('map'), // 지도를 표시할 div
  mapOption = {
    center: new daum.maps.LatLng(35.137922, 129.055628), // 지도의 중심좌표
    level: 9
    // 지도의 확대 레벨
  };


function device_check() {
  // 디바이스 종류 설정
  var pc_device = "win16|win32|win64|mac|macintel";
  // 접속한 디바이스 환경
  var this_device = navigator.platform;
  if (this_device) {
    if (pc_device.indexOf(navigator.platform.toLowerCase()) < 0) {
      device = "mobile";
    } else {
      device = "pc";
    }
  }
}

device_check();


const map = new kakao.maps.Map(mapContainer, mapOption);

const geocoder = new kakao.maps.services.Geocoder();

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();

const createOverlay = result => {
  const coords = new kakao.maps.LatLng(result[1], result[2]);
  const marker = new kakao.maps.Marker({
    map: map,
    position: coords
  });

  if (device == "mobile") {
    var infowindow = new daum.maps.InfoWindow({
      content: '<div style="font-size:3em; color:blue;">' + result[0] + '</div>',
      removable: 'true'
    });
  } else if (device == "pc") {
    var infowindow = new daum.maps.InfoWindow({
      // content : '<div style="width:50px;text-align:center;padding:3px 0;">I</div>'
      content: '<div style="font-size:1.5em; color:blue;">' + result[0] + '</div>',
      removable: 'true'
    });
  }

  inf_arr.push(infowindow);

  kakao.maps.event.addListener(marker, 'click', function() {
    // 마커 위에 인포윈도우를 표시합니다
    closeInfoWindow();
    infowindow.open(map, marker);
  });
};

const t_createOverlay = result => {
  const coords = new kakao.maps.LatLng(result[1], result[2]);
  const marker = new kakao.maps.Marker({
    map: map,
    position: coords
  });

  mar_arr.push(marker);

  if (device == "mobile") {
    var infowindow = new daum.maps.InfoWindow({
      content: '<div style="font-size:3em; color:blue;">' + result[0] + '</div>',
      removable: 'true'
    });
  } else if (device == "pc") {
    var infowindow = new daum.maps.InfoWindow({
      content: '<div style="font-size:1.5em; color:blue;">' + result[0] + '</div>',
      removable: 'true'
    });
  }

  kakao.maps.event.addListener(marker, 'click', function() {
    // 마커 위에 인포윈도우를 표시합니다
    closeInfoWindow();
    infowindow.open(map, marker);
  });
};

const keywordSearch = address => {
  return new Promise((resolve, reject) => {
    ps.keywordSearch(address, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        resolve(result);
      } else {
        resolve("n");
      }
    });
  });
};

function closeInfoWindow() {
  for (var idx = 0; idx < inf_arr.length; idx++) {
    inf_arr[idx].close();
  }
}

// async-await
async function ma() {
  for (i = 0; i < gbl_data['response'].length; i++) {
    var path_arr = gbl_data['response'][i].path.split('^');
    for (var j = 0; j < path_arr.length; j++) {
      gbl_path = path_arr[j].split('\n');

      if (gbl_path.length == 4) {

        if (gbl_path[2].indexOf('동래구청') != -1) gbl_path[3] = "동래구청";
        if (gbl_path[2].indexOf('수서역') != -1) gbl_path[3] = "수서역";
        if (gbl_path[2].indexOf('부산시교육청') != -1) gbl_path[3] = "부산시교육청";
        if ((gbl_path[2].indexOf('MV PC방') != -1) || (gbl_path[2].indexOf('엠브이PC방') != -1)) gbl_path[3] = "엠브이PC 괴정점";
        if (gbl_path[2].indexOf('엄마의 돼지국밥') != -1) gbl_path[3] = "부산진구 중앙대로 928번길 17";
        if (gbl_path[2].indexOf('메종 드 베르') != -1) gbl_path[3] = "경기 성남시 분당구 성남대로916번길 5";
        if (gbl_path[2].indexOf('초원약국') != -1) gbl_path[3] = "부산 사상구 가야대로 288";
        if (gbl_path[2].indexOf('소문난돼지국밥') != -1) gbl_path[3] = "동래구 미남로 140-1";
        if (gbl_path[2].indexOf('NC백화점') != -1) gbl_path[3] = "부산 해운대구 해운대로 813";
        if (gbl_path[2].indexOf('피부관리실') != -1) {
          gbl_path[2] = "보떼베르떼";
          gbl_path[3] = "해운대구 해운대로483번길 3";
        }
        if (gbl_path[2].indexOf('성황리마트') != -1) {
          gbl_path[2] = "성황리마트";
          gbl_path[3] = "동래구 충렬대로 108번길 100-4";
        }
        if (gbl_path[2].indexOf('대교마트(사직점)') != -1) {
          gbl_path[2] = "대교마트(사직점)";
          gbl_path[3] = "동래구 여고북로 156";
        }
        if ((gbl_path[2].indexOf('교보문고') != -1) && (gbl_path[3].indexOf('해운대 바로드림센터') != -1)) {
          gbl_path[2] = "교보문고 해운대 바로드림센터";
          gbl_path[3] = "교보문고 해운대 바로드림센터";
        }
        if ((gbl_path[2].indexOf('올타미스터스시') != -1) && (gbl_path[3].indexOf('화명점') != -1)) gbl_path[3] = "부산 북구 용당로5번길 12";
        if ((gbl_path[2].indexOf('스타벅스') != -1) && (gbl_path[3].indexOf('부산화명역점') != -1)) gbl_path[3] = "부산 북구 금곡대로 285번길 5";
        if ((gbl_path[2].indexOf('고봉민김밥인') != -1) && (gbl_path[3].indexOf('부산해운대좌동점') != -1)) gbl_path[3] = "부산 해운대구 좌동순환로 309";
        if (gbl_path[2].indexOf('양산M컨벤션8층웨딩홀') != -1) gbl_path[3] = "경남 양산시 중부로 2";
        if (gbl_path[2].indexOf('당구장 한작대기') != -1) {
          gbl_path[2] = "당구장 한작대기";
          gbl_path[3] = "부산진구 중앙대로691번길 44";
        }
        if (gbl_path[3].indexOf('금정구 장전온천로 73') != -1) gbl_path[3] = "금정구 장전온천천로 73";
        if (gbl_path[3].indexOf('경북 경주시 산내면 단성로 685') != -1) gbl_path[3] = "경북 경주시 산내면 단석로 686";
        if (gbl_path[3].indexOf('금정구 부산대학교64번길 12-8') != -1) gbl_path[3] = "금정구 부산대학로64번길 12-8";
        if (gbl_path[3].indexOf('장전동399-13') != -1) gbl_path[3] = "장전동399-13";
        if (gbl_path[3].indexOf('해운대구 좌동순환로 511') != -1) gbl_path[3] = "해운대구 좌동순환로 511";
        if (gbl_path[3].indexOf('해운대구 반여로 131') != -1) gbl_path[3] = "해운대구 반여로 131";
        if (gbl_path[3].indexOf('금정구 구서동 184-34') != -1) gbl_path[3] = "금정구 구서동 184-34";
        if (gbl_path[3].indexOf('동래구 충렬대로 428번길 15') != -1) gbl_path[3] = "동래구 충렬대로 428번길 15";
        if (gbl_path[3].indexOf('금정구 구서동 184-34') != -1) gbl_path[3] = "금정구 구서동 184-34";
        if (gbl_path[3].indexOf('부산진구 동평로 350') != -1) gbl_path[3] = "부산진구 동평로 350";
        if (gbl_path[3].indexOf('강서구 명지오션시티4로 87') != -1) gbl_path[3] = "부산 강서구 명지동 3240-2";
        if (gbl_path[3].indexOf('사하구 낙동대로199번길 3') != -1) gbl_path[3] = "부산 유성약국";

        if (gbl_path[2].indexOf('도시철도') == -1) {
          if (gbl_path[3].indexOf('확인중') == -1) {
            if (gbl_path[2].indexOf('삼촌밥런치펍') != -1) gbl_path[2] = gbl_path[2].replace("삼촌밥런치펍", "삼촌밥차런치펍");
            if (gbl_path[3].length < 7) {
              if ((gbl_path[3].indexOf('동래로') != -1) || (gbl_path[3].indexOf('금강로') != -1)) {

                const result = await keywordSearch(gbl_path[3]);
                var pname = gbl_data['response'][i].name + "<br>" + gbl_path[0] + "<br>" + gbl_path[1] + "<br>" + gbl_path[2];
                if (result !== "n") {
                  var check = 0;
                  for (var k = 0; k < arr.length; k++) {
                    if (result[0].y == arr[k][1] && result[0].x == arr[k][2]) {
                      var or = arr[k][0];
                      arr[k][0] = or + "<br>" + pname;
                      check++;
                      t_createOverlay(arr[k]);
                    }
                  }
                  if (check == 0) {
                    var al = arr.length;
                    arr[al] = new Array();
                    arr[al][0] = pname;
                    arr[al][1] = result[0].y;
                    arr[al][2] = result[0].x;
                    t_createOverlay(arr[al]);
                  }
                }

              } else if (gbl_path[3].indexOf('운동장') != -1) {

                const result = await keywordSearch(gbl_path[2].replace("~ ", ""));
                var pname = gbl_data['response'][i].name + "<br>" + gbl_path[0] + "<br>" + gbl_path[1] + "<br>" + gbl_path[2].replace("~ ", "");
                if (result !== "n") {
                  var check = 0;
                  for (var k = 0; k < arr.length; k++) {
                    if (result[0].y == arr[k][1] && result[0].x == arr[k][2]) {
                      var or = arr[k][0];
                      arr[k][0] = or + "<br>" + pname;
                      check++;
                      t_createOverlay(arr[k]);
                    }
                  }
                  if (check == 0) {
                    var al = arr.length;
                    arr[al] = new Array();
                    arr[al][0] = pname;
                    arr[al][1] = result[0].y;
                    arr[al][2] = result[0].x;
                    t_createOverlay(arr[al]);
                  }
                }


              } else if ((gbl_path[3].indexOf('점') != -1) || (gbl_path[3].indexOf('동') != -1)) {

                const result = await keywordSearch(gbl_path[2].replace("~ ", "") + " " + gbl_path[3]);
                var pname = gbl_data['response'][i].name + "<br>" + gbl_path[0] + "<br>" + gbl_path[1] + "<br>" + gbl_path[2].replace("~ ", "");
                if (result !== "n") {
                  var check = 0;
                  for (var k = 0; k < arr.length; k++) {
                    if (result[0].y == arr[k][1] && result[0].x == arr[k][2]) {
                      var or = arr[k][0];
                      arr[k][0] = or + "<br>" + pname;
                      check++;
                      t_createOverlay(arr[k]);
                    }
                  }
                  if (check == 0) {
                    var al = arr.length;
                    arr[al] = new Array();
                    arr[al][0] = pname;
                    arr[al][1] = result[0].y;
                    arr[al][2] = result[0].x;
                    t_createOverlay(arr[al]);
                  }
                }

              } else if ((gbl_path[2].indexOf('점') != -1) || (gbl_path[2].indexOf('아시아드 요양병원') != -1) || (gbl_path[2].indexOf('선산휴게소') != -1) || (gbl_path[2].indexOf('웨딩홀') != -1) || (gbl_path[2].indexOf('온천교회') != -1)) {

                const result = await keywordSearch(gbl_path[2].replace("~ ", ""));
                var pname = gbl_data['response'][i].name + "<br>" + gbl_path[0] + "<br>" + gbl_path[1] + "<br>" + gbl_path[2].replace("~ ", "");
                if (result !== "n") {
                  var check = 0;
                  for (var k = 0; k < arr.length; k++) {
                    if (result[0].y == arr[k][1] && result[0].x == arr[k][2]) {
                      var or = arr[k][0];
                      arr[k][0] = or + "<br>" + pname;
                      check++;
                      t_createOverlay(arr[k]);
                    }
                  }
                  if (check == 0) {
                    var al = arr.length;
                    arr[al] = new Array();
                    arr[al][0] = pname;
                    arr[al][1] = result[0].y;
                    arr[al][2] = result[0].x;
                    t_createOverlay(arr[al]);
                  }
                }

              } //else alert(gbl_data['response'][i].name + "<br>" + gbl_path[2] + "<br>" + gbl_path[3]);
            } else if (gbl_path[3].indexOf('층') != -1) {
              gbl_path[3] = gbl_path[3].substr(gbl_path[3].length - 3, 3);

              const result = await keywordSearch(gbl_path[3]);
              var pname = gbl_data['response'][i].name + "<br>" + gbl_path[0] + "<br>" + gbl_path[1] + "<br>" + gbl_path[2];
              if (result !== "n") {
                var check = 0;
                for (var k = 0; k < arr.length; k++) {
                  if (result[0].y == arr[k][1] && result[0].x == arr[k][2]) {
                    var or = arr[k][0];
                    arr[k][0] = or + "<br>" + pname;
                    check++;
                    t_createOverlay(arr[k]);
                  }
                }
                if (check == 0) {
                  var al = arr.length;
                  arr[al] = new Array();
                  arr[al][0] = pname;
                  arr[al][1] = result[0].y;
                  arr[al][2] = result[0].x;
                  t_createOverlay(arr[al]);
                }
              }

            } else {

              const result = await keywordSearch(gbl_path[3]);
              var pname = gbl_data['response'][i].name + "<br>" + gbl_path[0] + "<br>" + gbl_path[1] + "<br>" + gbl_path[2];
              if (result !== "n") {
                var check = 0;
                for (var k = 0; k < arr.length; k++) {
                  if (result[0].y == arr[k][1] && result[0].x == arr[k][2]) {
                    var or = arr[k][0];
                    arr[k][0] = or + "<br>" + pname;
                    check++;
                    t_createOverlay(arr[k]);
                  }
                }
                if (check == 0) {
                  var al = arr.length;
                  arr[al] = new Array();
                  arr[al][0] = pname;
                  arr[al][1] = result[0].y;
                  arr[al][2] = result[0].x;
                  t_createOverlay(arr[al]);
                }
                if (check == 0) {
                  var al = arr.length;
                  arr[al] = new Array();
                  arr[al][0] = pname;
                  arr[al][1] = result[0].y;
                  arr[al][2] = result[0].x;
                }
              }

            }
          }
        }
      } else if (gbl_path.length == 3) {

        if (gbl_path[2].indexOf('동래구청') != -1) gbl_path[3] = "동래구청";
        if (gbl_path[2].indexOf('수서역') != -1) gbl_path[3] = "수서역";
        if (gbl_path[2].indexOf('부산시교육청') != -1) gbl_path[3] = "부산시교육청";
        if ((gbl_path[2].indexOf('MV PC방') != -1) || (gbl_path[2].indexOf('엠브이PC방') != -1)) gbl_path[3] = "엠브이PC 괴정점";
        if (gbl_path[2].indexOf('엄마의 돼지국밥') != -1) gbl_path[3] = "부산진구 중앙대로 928번길 17";
        if (gbl_path[2].indexOf('메종 드 베르') != -1) gbl_path[3] = "경기 성남시 분당구 성남대로916번길 5";
        if (gbl_path[2].indexOf('피부관리실') != -1) {
          gbl_path[2] = "보떼베르떼";
          gbl_path[3] = "해운대구 해운대로483번길 3";
        }
        if (gbl_path[2].indexOf('양산M컨벤션8층웨딩홀') != -1) gbl_path[3] = "경남 양산시 중부로 2";
        if (gbl_path[2].indexOf('경남선경자이마트') != -1) gbl_path[2] = "경남선경 주변 자이마트";
        if (gbl_path[2].indexOf('쏭쏭돈까스 광안점') != -1) gbl_path[2] = "쑝쑝돈까스 광안점";
        if (gbl_path[2].indexOf('동래구 보건소') != -1) gbl_path[2] = "동래구 보건소";
        if (gbl_path[2].indexOf('사직자이언츠파크 쓰리팜PC방') != -1) gbl_path[2] = "사직자이언츠파크 쓰리팝PC방";
        if (gbl_path[2].indexOf('당구장 한작대기') != -1) {
          gbl_path[2] = "당구장 한작대기";
          gbl_path[3] = "부산진구 중앙대로691번길 44";
        }

        if (gbl_path[2].indexOf('도시철도') == -1) {
          if (gbl_path[2].indexOf('V-SPACE') != -1) gbl_path[2] = gbl_path[2].replace("V-SPACE", "브이스페이스");
          if ((gbl_path[2].indexOf('구보건소') != -1) || (gbl_path[2].indexOf('병무청') != -1)) gbl_path[2] = "부산 " + gbl_path[2];
          if (gbl_path[2].indexOf('멕시멈휘트니스') == 1) {

            const result = await keywordSearch("부산 동래구 사직북로 4");
            var pname = gbl_data['response'][i].name + "<br>" + gbl_path[0] + "<br>" + gbl_path[1] + "<br>" + gbl_path[2];
            if (result !== "n") {
              var check = 0;
              for (var k = 0; k < arr.length; k++) {
                if (result[0].y == arr[k][1] && result[0].x == arr[k][2]) {
                  var or = arr[k][0];
                  arr[k][0] = or + "<br>" + pname;
                  check++;
                  t_createOverlay(arr[k]);
                }
              }
              if (check == 0) {
                var al = arr.length;
                arr[al] = new Array();
                arr[al][0] = pname;
                arr[al][1] = result[0].y;
                arr[al][2] = result[0].x;
                t_createOverlay(arr[al]);
              }
            }

          } else {

            const result = await keywordSearch(gbl_path[2].replace("~ ", ""));
            var pname = gbl_data['response'][i].name + "<br>" + gbl_path[0] + "<br>" + gbl_path[1] + "<br>" + gbl_path[2].replace("~ ", "");
            if (result !== "n") {
              var check = 0;
              for (var k = 0; k < arr.length; k++) {
                if (result[0].y == arr[k][1] && result[0].x == arr[k][2]) {
                  var or = arr[k][0];
                  arr[k][0] = or + "<br>" + pname;
                  check++;
                  t_createOverlay(arr[k]);
                }
              }
              if (check == 0) {
                var al = arr.length;
                arr[al] = new Array();
                arr[al][0] = pname;
                arr[al][1] = result[0].y;
                arr[al][2] = result[0].x;
                t_createOverlay(arr[al]);
              }
            }

          }
        }
      }
    }

    document.getElementById("load").innerHTML = i + " / " + gbl_data['response'].length;
  }
  for (var m = 0; m < mar_arr.length; m++) {
    mar_arr[m].setMap(null);
  }

  for (var i = 0; i < arr.length; i++) {
    console.log(arr[i]);
    createOverlay(arr[i]);
  }
  $("#loading").hide();
  document.getElementById("map").style.height="99vh";
  document.getElementById("map_").style.height="95%";
}

ma();
