# Package editable AmberFrame Remotion Studio project into ZIP (excludes node_modules & out)
$ErrorActionPreference = "Stop"
$zipName = "AmberFrame_Studio_Complete_Project.zip"
if (Test-Path $zipName) { Remove-Item $zipName -Force }

$include = @(
    "src",
    "public",
    "library",
    "scripts",
    "package.json",
    "tsconfig.json",
    "remotion.config.ts",
    "check_gpu.ps1",
    "render_nvidia.ps1",
    "render_cpu.ps1",
    "package_project.ps1",
    "README.md",
    "IMPLEMENTATION_REPORT.md"
)

Compress-Archive -Path $include -DestinationPath $zipName -CompressionLevel Optimal
Write-Host "Packaged -> $zipName" -ForegroundColor Green
