# Xero Studio — Windows GPU & Toolchain Check (RTX 3060 Ready)
$ErrorActionPreference = "SilentlyContinue"
Write-Host "=== Xero Cinematic Studio :: Windows Environment Check ===" -ForegroundColor Cyan

# 1. Node.js
$nodeVer = node -v
if ($nodeVer) {
    Write-Host "[OK] Node.js: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Node.js not found. Install Node.js 20+ LTS." -ForegroundColor Red
}

# 2. NVIDIA GPU
$gpu = nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader
if ($gpu) {
    Write-Host "[OK] NVIDIA GPU: $gpu" -ForegroundColor Green
} else {
    Write-Host "[WARN] nvidia-smi not found. CPU encoding fallback available." -ForegroundColor Yellow
}

# 3. FFmpeg & NVENC
$ffmpegVer = ffmpeg -version | Select-Object -First 1
if ($ffmpegVer) {
    Write-Host "[OK] FFmpeg: $ffmpegVer" -ForegroundColor Green
    $nvenc = ffmpeg -hide_banner -encoders | Select-String "h264_nvenc"
    if ($nvenc) {
        Write-Host "[OK] Hardware Encoder h264_nvenc available!" -ForegroundColor Green
    } else {
        Write-Host "[WARN] h264_nvenc not found in this FFmpeg build. Use render_cpu.ps1 or install full FFmpeg." -ForegroundColor Yellow
    }
} else {
    Write-Host "[FAIL] FFmpeg not found in PATH." -ForegroundColor Red
}

# 4. Dependencies check
if (Test-Path "node_modules/@remotion/cli") {
    Write-Host "[OK] Remotion CLI dependencies installed." -ForegroundColor Green
} else {
    Write-Host "[INFO] Run 'npm install' inside studio/ before rendering." -ForegroundColor Yellow
}

# 5. Episode validation
if (Test-Path "scripts/validate_episode.mjs") {
    node scripts/validate_episode.mjs
}
