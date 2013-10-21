<?php
$data_string = file_get_contents('php://input');
//print_r($data_string);

$data = $_POST['data'];
$url = $_POST['url'];
$method = $_POST['method'];

//print_r($data);
//print_r($url);
//print_r($method);

$curl = curl_init();

curl_setopt_array($curl, array(
	CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $url,
 	//CURLOPT_POST => 1,
 	CURLOPT_CUSTOMREQUEST => $method,
 	CURLOPT_POSTFIELDS => $data
));

$resp = curl_exec($curl);
//print_r($resp);
$resp_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);


HttpResponse::status($resp_code);
HttpResponse::status($data_string);
HttpResponse::setContentType('application/json');
HttpResponse::setData($resp);
HttpResponse::send();

curl_close($curl);
?>