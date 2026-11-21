param(
    [ValidateSet("KhizanatAlGhurfa", "HalTaarifInnakaTahlum")]
    [string]$Episode = "KhizanatAlGhurfa",
    [int]$CRF = 15,
    [int]$Concurrency = 4,
    [switch]$SkipFrames
)

$ErrorActionPreference = "Stop"
Write-Host "=== AmberFrame Studio :: High-Quality CPU Render ($Episode, libx264 CRF=$CRF) ===" -ForegroundColor Cyan

if (-not (Test-Path "node_modules/@remotion/cli")) {
    Write-Host "Installing Remotion dependencies..." -ForegroundColor Yellow
    npm install
}

New-Item -ItemType Directory -Force -Path "out/frames" | Out-Null

if (-not $SkipFrames) {
    Write-Host "[1/3] Rendering PNG sequence via Remotion..." -ForegroundColor Cyan
    npx remotion render src/index.ts $Episode out/frames `
        --sequence `
        --image-format=png `
        --concurrency=$Concurrency `
        --overwrite
}

if ($Episode -eq "KhizanatAlGhurfa") {
    $voice = "public/khizanat-al-ghurfa/voice.mp3"
    $sfx   = "public/khizanat-al-ghurfa/sfx.mp3"
    $music = "public/khizanat-al-ghurfa/music.mp3"
    $audioFilter = "[0:a]volume=1.0[v];[1:a]volume=0.88[s];[2:a]volume=0.65[m];[v][s][m]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]"
    $outMp4 = "out/Khizanat_Al_Ghurfa_1080p_CPU.mp4"
} else {
    $voice = "public/hal-taarif-innaka-tahlum/voice.mp3"
    $sfx   = "public/hal-taarif-innaka-tahlum/sfx.mp3"
    $music = "public/hal-taarif-innaka-tahlum/music.mp3"
    $audioFilter = "[0:a]volume=1.0[v];[1:a]volume=0.13[s];[2:a]volume=0.05[m];[v][s][m]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]"
    $outMp4 = "out/Hal_Taarif_Innaka_Tahlum_1080p_CPU.mp4"
}

Write-Host "[2/3] Mastering 3-stem audio mix (-14 LUFS)..." -ForegroundColor Cyan
$masterAudio = "out/master_audio.wav"
ffmpeg -y -i $voice -i $sfx -i $music `
    -filter_complex $audioFilter `
    -map "[aout]" -ar 48000 -ac 2 -c:a pcm_s24le $masterAudio

Write-Host "[3/3] Encoding MP4 via libx264 (slow preset, CRF=$CRF)..." -ForegroundColor Cyan
ffmpeg -y -framerate 30 -i "out/frames/element-%05d.png" -i $masterAudio `
    -c:v libx264 -preset slow -crf $CRF -pix_fmt yuv420p `
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 `
    -c:a aac -b:a 320k -movflags +faststart `
    $outMp4

Write-Host "DONE -> $outMp4" -ForegroundColor Green
