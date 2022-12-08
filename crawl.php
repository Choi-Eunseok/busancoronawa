<?php
  ini_set("allow_url_fopen",1);
  include"simple_html_dom.php";
  $data = file_get_html("http://www.busan.go.kr/corona19/index");

  $a = $data->find('span.item2');
  $count = preg_replace("/[^0-9]*/s", "", $a[0]->plaintext);

  $con = mysqli_connect("localhost", "user", "password", "dbname");

  $no = "자택, 택시, 버스, 도보, 외출하지, 자가용, 집, 구급차, 보건소이송";

  $result = mysqli_query($con, "SELECT * FROM corona;");
  $rows = mysqli_num_rows($result);
  $num = 0;
  $name = "";
  $age = 0;
  $gender = "";
  $home = "";
  $infection_path = "";
  $contact = "";
  $facility = "";
  $path = "";


  function filter($d, $date_a, $i2, $no){
    global $con;
    global $rows;
    global $num;
    global $name;
    global $age;
    global $gender;
    global $home;
    global $infection_path;
    global $contact;
    global $facility;
    global $path;

    $path_arr = explode('⇒' , $d);
    foreach ($path_arr as $key => $value) {
      $no_check = 0;
      $no_arr = explode(', ', $no);
      foreach ($no_arr as $key2 => $value2) {
        if(strpos($value, $value2) !== false) $no_check = 1;
      }
      if($no_check == 1) ;
      else{
        $time = explode(':', trim($value));
        if(count($time) == 3){
          $time_temp = substr($time[2], 0, 2);
          $tim = $time[0] . ":" . $time[1] . ":" . $time_temp;
        }else if(count($time) == 2){
          $time_temp = substr($time[1], 0, 2);
          $tim = $time[0] . ":" . $time_temp;
        }
        $place_name = explode($tim, trim($value));
        if(strlen($place_name[1]) > 0){
          $place_add = explode('(', $place_name[1]);
          $place_na = "";
          if(count($place_add) == 1){
            $date_abc = str_replace("&nbsp;", " ", $date_a[$i2]);
            $path = $path . "^" . trim($date_abc) . "\n" . trim($tim) . "\n" . trim($place_add[0]);

            // echo "^" . $date_a[$i2] . "<br />";
            // echo $tim . "<br />";
            // echo $place_add[0] . "<br />";
          }else {
            foreach ($place_add as $key2 => $value3) {
              if($key2 == count($place_add) -1){
                $place_ad = "(" . $value3;
              }else {
                if($key2 !== 0) $place_na = $place_na . "(";
                $place_na = $place_na . $value3;
              }
            }
            $place_ad = str_replace("(", " ", $place_ad);
            $place_ad = str_replace(")", " ", $place_ad);
            $place_ad2 = explode(",", $place_ad);
            if(mb_strlen($place_ad2[0], "UTF-8") > mb_strlen($place_ad2[1], "UTF-8")) $placerad = $place_ad2[0];
            else $placerad = $place_ad2[1];

            // echo "^" . $date_a[$i2] . "<br />";
            // echo $tim . "<br />";
            // echo $place_na . "<br />";
            // echo $placerad . "<br />";
            $date_abc = str_replace("&nbsp;", " ", $date_a[$i2]);
            $path = $path . "^" . trim($date_abc) . "\n" . trim($tim) . "\n" . trim($place_na) . "\n" . trim($placerad);
          }
        }
      }
    }
  }

  function cal_path($date_m, $path_aa, $no){
    global $count;
    global $con;
    global $rows;
    global $num;
    global $name;
    global $age;
    global $gender;
    global $home;
    global $infection_path;
    global $contact;
    global $facility;
    global $path;

    $date_a = explode('/', $date_m);
    $co = count($date_a);
    for($i2 = 0; $i2 < $co; $i2++){
      $c = explode('월', $date_a[$i2]);
      if(count($c) >1){
      }
      else {
        unset($date_a[$i2]);
      }
    }
    $date_a = array_values($date_a);
    for($i2 = 0; $i2 < count($date_a); $i2++){
      if($i2 == count($date_a)-1){
        $a = explode($date_a[$i2], $path_aa);
        $d = str_replace("&nbsp;", " ", $a[1]);
        filter($d, $date_a, $i2, $no);
      }else {
        $a = explode($date_a[$i2], $path_aa);
        $b = explode($date_a[$i2+1], $a[1]);
        $d = str_replace("&nbsp;", " ", $b[0]);
        filter($d, $date_a, $i2, $no);
      }
    }
    if($num > $rows){
      $statement = mysqli_prepare($con, "INSERT INTO corona VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  	  mysqli_stmt_bind_param($statement, "isisssiss", $num, $name, $age, $gender, $home, $infection_path, $contact, $facility, $path);
      mysqli_stmt_execute($statement);
    }else{
      $statement = mysqli_prepare($con, "UPDATE corona SET name = '$name', age = '$age', gender = '$gender', home = '$home', infection_path = '$infection_path', contact = '$contact',  facility = '$facility' , path = '$path' WHERE num = '$num'");
  	  mysqli_stmt_execute($statement);
    }
    $path = "";
  }

  $corona = $data->find('div.list_body');
  $i = 0;
  // if($corona[0]->children(0)->plaintext == ""){
  //   $count++;
  //   $i++;
  // }
  for($i; $i < $count; $i++){
    $num = $count - $i;

    $one = explode('(' , $corona[0]->children($i)->children(0)->plaintext);
    $name = $one[0];

    $two = explode('/' , $one[1]);
    $age = preg_replace("/[^0-9]*/s", "", $two[0]);

    $gender = $two[1];

    $home_arr = explode(')' , $two[2]);
    $home = $home_arr[0];

    $infection_path = $corona[0]->children($i)->children(1)->plaintext;

    $contact = preg_replace("/[^0-9]*/s", "", $corona[0]->children($i)->children(2)->plaintext);

    $facility = $corona[0]->children($i)->children(3)->plaintext;

    $path_aa = $corona[0]->children($i)->children(5)->plaintext;
    $date_parrent_b = $corona[0]->children($i)->children(5)->find("b");
    $date_parrent_strong = $corona[0]->children($i)->children(5)->find("strong");
    $date_m = "";
    foreach($date_parrent_strong as $key34 => $value34){
      if(strpos($value34, '⇒')){
        unset($date_parrent_strong[$key34]);
      }
    }
    $date_parrent_strong = array_values($date_parrent_strong);
    foreach($date_parrent_strong as $key34 => $value34){
    }
    foreach($date_parrent_b as $key34 => $value34){
      if(strpos($value34, '⇒')){
        unset($date_parrent_b[$key34]);
      }
    }
    $date_parrent_b = array_values($date_parrent_b);
    foreach($date_parrent_b as $key34 => $value34){
    }
    if($date_parrent_b[0]->plaintext == ""){
      foreach ($date_parrent_strong as $key) {
        $date_m = $date_m . $key->plaintext . "/";
      }
      cal_path($date_m, $path_aa, $no);
    }else if($date_parrent_strong[0]->plaintext == ""){
      foreach ($date_parrent_b as $key) {
        $date_m = $date_m . $key->plaintext . "/";
      }
      cal_path($date_m, $path_aa, $no);
    }else {
      $date_parent_com = array_merge($date_parrent_b, $date_parrent_strong);
      foreach ($date_parent_com as $key) {
        $date_m = $date_m . $key->plaintext . "/";
      }
      cal_path($date_m, $path_aa, $no);
    }
  }

?>
