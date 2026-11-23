<?php
$app = App\Models\Application::where('uuid', 'rs00nzpehzyvnvjaspafa97v')->first();
if ($app) {
    echo "Found app: " . $app->name . "\n";
    if (function_exists('queue_application_deployment')) {
        $deployment_uuid = new Illuminate\Support\Str::uuid();
        queue_application_deployment(application: $app, deployment_uuid: (string)$deployment_uuid);
        echo "Queued deployment: " . $deployment_uuid . "\n";
    } else {
        echo "Helper function queue_application_deployment not found, checking methods...\n";
        print_r(get_class_methods($app));
    }
} else {
    echo "App not found\n";
}

