param(
    [ValidateSet("KhizanatAlGhurfa", "HalTaarifInnakaTahlum")]
    [string]$Episode = "KhizanatAlGhurfa",
    [ValidateSet("1080p", "1440p", "4k")]
    [string]$Resolution = "1080p",
    [int]$CQ = 16,
    [int]$Concurrency = 6,
    [switch]$SkipFrames
)

$ErrorActionPreference = "Stop"
Write-Host "=== AmberFrame Studio :: NVIDIA RTX 3060 NVENC Render ($Episode @ $Resolution) ===" -ForegroundColor Cyan

if (-not (Test-Path "node_modules/@remotion/cli")) {
    Write-Host "Installing Remotion dependencies..." -ForegroundColor Yellow
    npm install
}

New-Item -ItemType Directory -Force -Path "out/frames" | Out-Null

$scaleFactor = switch ($Resolution) {
    "1080p" { 1 }
    "1440p" { 1.3333333 }
    "4k"    { 2 }
}

if (-not $SkipFrames) {
    Write-Host "[1/3] Rendering crisp PNG frames via Remotion (Concurrency=$Concurrency, Scale=$scaleFactor)..." -ForegroundColor Cyan
    npx remotion render src/index.ts $Episode out/frames `
        --sequence `
        --image-format=png `
        --scale=$scaleFactor `
        --concurrency=$Concurrency `
        --gl=angle `
        --overwrite
}

if ($Episode -eq "KhizanatAlGhurfa") {
    $voice = "public/khizanat-al-ghurfa/voice.mp3"
    $sfx   = "public/khizanat-al-ghurfa/sfx.mp3"
    $music = "public/khizanat-al-ghurfa/music.mp3"
    $audioFilter = "[0:a]volume=1.0[v];[1:a]volume=0.88[s];[2:a]volume=0.65[m];[v][s][m]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]"
    $outMp4 = "out/Khizanat_Al_Ghurfa_${Resolution}_NVENC.mp4"
} else {
    $voice = "public/hal-taarif-innaka-tahlum/voice.mp3"
    $sfx   = "public/hal-taarif-innaka-tahlum/sfx.mp3"
    $music = "public/hal-taarif-innaka-tahlum/music.mp3"
    $audioFilter = "[0:a]volume=1.0[v];[1:a]volume=0.13[s];[2:a]volume=0.05[m];[v][s][m]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]"
    $outMp4 = "out/Hal_Taarif_Innaka_Tahlum_${Resolution}_NVENC.mp4"
}

Write-Host "[2/3] Mastering 3-stem audio mix (Voice + SFX + Restrained Music at -14 LUFS)..." -ForegroundColor Cyan
$masterAudio = "out/master_audio.wav"
ffmpeg -y -i $voice -i $sfx -i $music `
    -filter_complex $audioFilter `
    -map "[aout]" -ar 48000 -ac 2 -c:a pcm_s24le $masterAudio

Write-Host "[3/3] Encoding crisp H.264 MP4 via NVIDIA RTX 3060 (h264_nvenc, CQ=$CQ)..." -ForegroundColor Cyan
ffmpeg -y -framerate 30 -i "out/frames/element-%05d.png" -i $masterAudio `
    -c:v h264_nvenc -preset p7 -tune hq -rc vbr -cq $CQ -b:v 16M -maxrate 24M -bufsize 32M `
    -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 `
    -c:a aac -b:a 320k -movflags +faststart `
    $outMp4

Write-Host "DONE -> $outMp4" -ForegroundColor Green
