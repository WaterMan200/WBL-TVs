<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers for JSON output and CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Path to the quotes.json file
$jsonPath = realpath(__DIR__ . "/../json/quotes.json");

// Ensure the file exists
if (!$jsonPath || !file_exists($jsonPath)) {
    http_response_code(500);
    echo json_encode(["error" => "Quotes file not found."]);
    exit;
}

// Load and decode the full JSON data
$jsonData = file_get_contents($jsonPath);
$data = json_decode($jsonData, true);

// Verify the expected structure is present
if (!isset($data["quotes"]) || !is_array($data["quotes"])) {
    http_response_code(500);
    echo json_encode(["error" => "Invalid quotes format."]);
    exit;
}

$today = date("Y-m-d");

// If today's quote isn't already set, choose one at random
if (!(isset($data["dailyQuote"]) && isset($data["dailyQuote"]["date"]) && $data["dailyQuote"]["date"] === $today)) {
    $randomQuote = $data["quotes"][array_rand($data["quotes"])];
    $data["dailyQuote"] = [
        "date" => $today,
        "quote" => $randomQuote
    ];
}

// Write the entire updated structure back to the file
if (file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to write updated quotes file."]);
    exit;
}

// Read the updated file and output the entire JSON structure
$updatedData = file_get_contents($jsonPath);
echo $updatedData;
