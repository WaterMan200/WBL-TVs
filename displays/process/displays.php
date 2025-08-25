<?php
// Set header to allow CORS and JSON input/output
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Path to the JSON file
$jsonPath = realpath(__DIR__ . "/../json/quotes.json");

// Make sure the file exists
if (!file_exists($jsonPath)) {
    http_response_code(500);
    echo json_encode(["error" => "Quotes file not found."]);
    exit;
}

// Read existing quotes
$jsonData = file_get_contents($jsonPath);
$data = json_decode($jsonData, true);

if (!isset($data["quotes"]) || !is_array($data["quotes"])) {
    http_response_code(500);
    echo json_encode(["error" => "Invalid quotes format."]);
    exit;
}

// Get today's date
$today = date("Y-m-d");

// If daily quote is already set for today, return it
if (isset($data["dailyQuote"]) && $data["dailyQuote"]["date"] === $today) {
    echo json_encode($data["dailyQuote"]);
    exit;
}

// Pick a new random quote
$randomQuote = $data["quotes"][array_rand($data["quotes"])];
$data["dailyQuote"] = [
    "date" => $today,
    "quote" => $randomQuote
];

// Save updated data back to JSON
if (file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT))) {
    echo json_encode($data["dailyQuote"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to write updated quote."]);
}
