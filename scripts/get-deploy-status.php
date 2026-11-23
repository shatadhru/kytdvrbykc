<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$application = App\Models\Application::where('uuid', 'rs00nzpehzyvnvjaspafa97v')->first();
$latest = App\Models\ApplicationDeploymentQueue::where('application_id', $application->id)->latest()->first();

echo "Deployment ID: " . $latest->id . "\n";
echo "Status: " . $latest->status . "\n";
echo "Commit: " . $latest->commit . "\n";
echo "Updated: " . $latest->updated_at . "\n";
if ($latest->logs) {
    echo "--- LAST LOGS ---\n";
    $lines = explode("\n", $latest->logs);
    $tail = array_slice($lines, -15);
    echo implode("\n", $tail) . "\n";
}
