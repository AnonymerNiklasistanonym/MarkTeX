#!/usr/bin/env pwsh

Function Test-CommandExists {
  Param($command)
  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = ‘stop’
  try {
    if (Get-Command $command){
      RETURN $true
    }
  } catch {
    RETURN $false
  } finally {
    $ErrorActionPreference=$oldPreference
  }
}

if (-Not (Test-CommandExists inkscape)) { 
  Write-Host 'Error: inkscape is not installed. https://inkscape.org/release'
  exit 1
}

if (-Not (Test-CommandExists magick)) { 
  Write-Host 'Error: image magick is not installed. https://www.imagemagick.org/script/download.php'
  exit 1
}

# PNG export: Declare an array with the image sizes
[int[]]$PNG_SIZES = 16, 48, 128, 180, 196, 256, 512
foreach ($PNG_SIZE in $PNG_SIZES) {
	# Export each size as a `png` favicon from `favicon.svg`
	inkscape "favicon.svg" --export-png="favicon_"$PNG_SIZE".png" --export-width=$PNG_SIZE --export-height=$PNG_SIZE --without-gui
}

# ICO export:
magick convert "favicon_512.png" -define icon:auto-resize=16,32,48,64,96,128,256 "favicon.ico"

