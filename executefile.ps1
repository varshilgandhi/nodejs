Start-Sleep -Seconds 5  # Add a delay of 30 seconds
$body = @{
    key = "value"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8099/hbheartbeat" -Method Put -ContentType "application/json" -Body $body
