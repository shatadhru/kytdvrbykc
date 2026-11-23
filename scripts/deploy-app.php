<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Application;
use App\Jobs\ApplicationDeploymentJob;

$application = Application::where('uuid', 'rs00nzpehzyvnvjaspafa97v')->first();
if ($application) {
    echo "Found app: " . $application->name . "\n";
    $application->git_commit_sha = 'HEAD';
    $application->save();
    $deployment_uuid = (string) Illuminate\Support\Str::uuid();
    $result = queue_application_deployment(
        application: $application,
        deployment_uuid: $deployment_uuid,
        force_rebuild: true,
        no_questions_asked: true
    );
    echo "Result status: " . ($result['status'] ?? 'unknown') . "\n";
    if (isset($result['deployment'])) {
        $dep = $result['deployment'];
        echo "Deployment ID: " . $dep->id . " Status: " . $dep->status . "\n";
        // Ensure job is dispatched
        ApplicationDeploymentJob::dispatch(application_deployment_queue_id: $dep->id);
        echo "ApplicationDeploymentJob dispatched for ID: " . $dep->id . "\n";
    }
} else {
    echo "App not found!\n";
}
