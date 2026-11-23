<?php
$app = App\Models\Application::where('uuid', 'rs00nzpehzyvnvjaspafa97v')->first();
if ($app) {
    echo "Found app: " . $app->name . " (previous sha: " . $app->git_commit_sha . ")\n";
    $app->git_commit_sha = 'HEAD';
    $app->save();
    $deployment_uuid = (string) new Illuminate\Support\Str::uuid();
    queue_application_deployment($app, $deployment_uuid, force_rebuild: true);
    echo "Successfully queued rebuild deployment: " . $deployment_uuid . "\n";
} else {
    echo "App rs00nzpehzyvnvjaspafa97v not found!\n";
}
